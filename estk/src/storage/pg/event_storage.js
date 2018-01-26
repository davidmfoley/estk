// @flow
import type { DatabaseClient } from '../types'
import type { Event, EventPublishRequest, EventLookup, EventStream } from '../../types'
import PostgresEventStream from './event_stream';
import timestamps from  '../timestamps';
import rowToEvent from './row_to_event';

const debug = require('debug')('PostgresEventStorage');

export default function PostgresEventStorage(client: DatabaseClient) {
  const storage = {
    createSchema,
    deleteAll,
    publish,
    getEventStream,
    close: () => Promise.resolve()
  };

  function deleteAll(): Promise<void> {
    debug('delete all events');
    return client.query('delete from events;').then(() => undefined);
  }

  function createSchema(): Promise<void> {
    debug('create event schema');

    return client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id serial primary key,
        target_type character varying NOT NULL,
        target_id character varying,
        action character varying NOT NULL,
        data jsonb,
        meta jsonb,
        "timestamp" timestamp without time zone default (now() at time zone 'utc')
      );
    `).then(() => undefined);
  }

  function publish(event: EventPublishRequest): Promise<Event> {
    const params = [
      event.targetType,
      event.targetId,
      event.action,
      event.meta,
      event.data,
      timestamps.now()
    ];

    const sql = `
      INSERT INTO events (
        target_type,
        target_id,
        action,
        meta,
        data,
        timestamp
      ) values ( $1, $2, $3, $4, $5, $6 ) 
      RETURNING *;`;

    return client.query(sql, params).then(rows => {
      const { id, timestamp, target_type, target_id, action, data, meta} = rows[0];
      debug(`inserted ${id} ${timestamp} ${target_type} ${target_id} ${action} ${data} ${meta}`);
      return rowToEvent(rows[0]);
    });
  }


  function getEventStream(lookup: EventLookup): Promise<EventStream> {
    return Promise.resolve(PostgresEventStream(client, lookup));
  }

  return Promise.resolve(storage);
}

