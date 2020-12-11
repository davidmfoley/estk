import { describe } from 'mocha';
import { expect } from 'chai';
import { createEventStore } from 'estk-events';
import { PostgresClient } from 'estk-pg';
import PostgresEventStorage from '../src/event_storage';
import { TestSuites } from 'estk-events';
import { start } from 'repl';

describe('with a schema setting', () => {
  const config = {
    url: process.env.DATABASE_URL_TEST || '',
    poolSize: 10,
  };

  const startStore = async () => {
    const client = await PostgresClient(config);
    const storage: any = await PostgresEventStorage(client, {
      schema: 'testSchema',
    });
    await storage.createSchema();
    await storage.deleteAll();
    return createEventStore({
      storage,
    });
  };

  it('creates the events table in the specified schema', async () => {
    await startStore();

    const client = await PostgresClient(config);
    const count = await client.query({
      sql: 'select count(*) as "eventCount" from "testSchema"."events"',
    });

    expect(count[0].eventCount).to.eq(0);
  });

  TestSuites.storage(startStore);
});
