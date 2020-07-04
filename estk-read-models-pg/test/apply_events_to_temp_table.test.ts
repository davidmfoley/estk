import { PostgresClient, DatabaseClient } from 'estk-pg';
import sandwich from './models/sandwich';
import createTempTable from '../src/rebuild/create_temp_table';
import applyEventsToTempTable from '../src/rebuild/apply_events_to_temp_table';
import { createEventStore } from 'estk-events';
import InMemoryEventStorage from 'estk-events-in-memory';
import { expect } from 'chai';
import { EventStore } from '../../estk-events/lib';

describe('apply_events_to_temp_table', () => {
  let client: DatabaseClient;
  let tempTable: string;
  let eventStore: EventStore;

  beforeEach(async () => {
    client = await PostgresClient({
      url: process.env.DATABASE_URL_TEST || '',
    });

    tempTable = await createTempTable(client, sandwich);
    eventStore = await createEventStore({
      storage: InMemoryEventStorage(),
    });
  });

  it('handles no events', async () => {
    const stream = await eventStore.getEventStream({});
    await applyEventsToTempTable(sandwich, client, stream, tempTable);

    const result = await client.query({ sql: `select * from ${tempTable}` });
    expect(result.length).to.eq(0);
  });

  it('handles an event', async () => {
    await eventStore.publish([
      {
        targetType: 'sandwich',
        targetId: '42',
        action: 'make',
        data: { meat: 'roast beast', bread: 'rye' },
      },
    ]);

    const stream = await eventStore.getEventStream({});
    await applyEventsToTempTable(sandwich, client, stream, tempTable);

    const result = await client.query({ sql: `select * from ${tempTable}` });
    expect(result.length).to.eq(1);
  });
});
