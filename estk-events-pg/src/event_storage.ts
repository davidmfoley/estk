import { Timestamps } from 'estk-events';
import { DatabaseClient, DatabaseQuery } from 'estk-pg';
import { Event, EventPublishRequest, EventLookup, EventStorage } from 'estk-events';
import PostgresEventStream from './event_stream';
import rowToEvent from './row_to_event';

const debug = require('debug')('PostgresEventStorage');

type PostgresStorage = {
  createSchema: Function;
  deleteAll: Function;
} & EventStorage;
export default function PostgresEventStorage(client: DatabaseClient): Promise<PostgresStorage> {
  return Promise.resolve({
    publish,
    getEventStream: (lookup: EventLookup) => Promise.resolve(PostgresEventStream(client, lookup)),
    close: () => Promise.resolve(),
    createSchema,
    deleteAll
  });

  function deleteAll(): Promise<void> {
    debug('delete all events');
    return client.query({
      sql: 'delete from events;'
    }).then(() => undefined);
  }

  function createSchema(): Promise<void> {
    debug('create event table');
    return client.query({
      sql: `
      CREATE TABLE IF NOT EXISTS events (
        id serial primary key,
        target_type character varying NOT NULL,
        target_id character varying,
        action character varying NOT NULL,
        data jsonb,
        meta jsonb,
        "timestamp" timestamp without time zone default (now() at time zone 'utc')
      );`
    }).then(() => undefined);
  }

  async function publish(events: EventPublishRequest[], onPublished: Function): Promise<Event[]> {
    const transaction = await client.transaction();

    try {
      const published = [];

      for (let event of events) {
        const {
          sql,
          params
        } = buildQuery(event);
        const rows = await transaction.query({
          sql,
          params
        });
        const {
          id,
          timestamp,
          target_type,
          target_id,
          action,
          data,
          meta
        } = rows[0];
        debug(`inserted ${id} ${timestamp} ${target_type} ${target_id} ${action} ${data} ${meta}`);
        published.push(rowToEvent(rows[0]));
      }

      onPublished(published, {
        client,
        transaction
      });
      await transaction.commit();
      return published;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }
}

function buildQuery(event: EventPublishRequest): DatabaseQuery {
  return {
    params: [event.targetType, event.targetId, event.action, event.meta, event.data, Timestamps.now()],
    sql: `
      INSERT INTO events (
        target_type,
        target_id,
        action,
        meta,
        data,
        timestamp
      ) values ( $1, $2, $3, $4, $5, $6 ) 
      RETURNING *;`
  };
}
