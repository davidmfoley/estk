import { Timestamps } from 'estk-events'
import { DatabaseClient, DatabaseQuery } from 'estk-pg'
import {
  Event,
  EventPublishRequest,
  EventLookup,
  EventStorage,
} from 'estk-events'
import PostgresEventStream from './event_stream'
import rowToEvent from './row_to_event'

const debug = require('debug')('PostgresEventStorage')
interface PostgresStorageConfig {
  schema?: string
}

type PostgresStorage = {
  createSchema: Function
  deleteAll: Function
} & EventStorage
export default async function PostgresEventStorage(
  client: DatabaseClient,
  config: PostgresStorageConfig = {}
): Promise<PostgresStorage> {
  const tableName = config.schema ? `"${config.schema}".events` : 'events'

  const buildQuery = (event: EventPublishRequest): DatabaseQuery => ({
    params: [
      event.targetType,
      event.targetId,
      event.action,
      event.meta,
      event.data,
      Timestamps.now(),
    ],
    sql: `
      INSERT INTO ${tableName} (
        target_type,
        target_id,
        action,
        meta,
        data,
        timestamp
      ) values ( $1, $2, $3, $4, $5, $6 )
      RETURNING *;`,
  })

  return {
    publish,
    getEventStream: (lookup: EventLookup) =>
      Promise.resolve(PostgresEventStream(client, tableName, lookup)),
    close: () => client.close(),
    createSchema,
    deleteAll,
  }

  async function deleteAll(): Promise<void> {
    debug('delete all events')
    await client.query({
      sql: `delete from ${tableName};`,
    })
  }

  async function createSchema(): Promise<void> {
    if (config.schema) {
      debug(`create schema ${config.schema}`)
      await client.query({
        sql: `create schema if not exists "${config.schema}";`,
      })
    }

    debug('create event table')
    await client.query({
      sql: `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id serial primary key,
          target_type character varying NOT NULL,
          target_id character varying,
          action character varying NOT NULL,
          data jsonb,
          meta jsonb,
          "timestamp" timestamp without time zone default (now() at time zone 'utc')
      );`,
    })
  }

  type OnPublished = (events: Event[], context: any) => {}

  async function publish(
    events: EventPublishRequest[],
    onPublished: OnPublished
  ): Promise<Event[]> {
    const transaction = await client.transaction()

    try {
      const published = []

      for (let event of events) {
        const { sql, params } = buildQuery(event)
        const rows = await transaction.query({
          sql,
          params,
        })
        const {
          id,
          timestamp,
          target_type,
          target_id,
          action,
          data,
          meta,
        } = rows[0]
        debug(
          `inserted ${id} ${timestamp} ${target_type} ${target_id} ${action} ${data} ${meta}`
        )
        published.push(rowToEvent(rows[0]))
      }

      await onPublished(published, {
        client,
        transaction,
      })
      await transaction.commit()
      return published
    } catch (e) {
      await transaction.rollback()
      throw e
    }
  }
}
