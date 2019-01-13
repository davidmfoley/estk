import { describe } from 'mocha';
import { createEventStore } from 'estk-events';
import { PostgresClient } from 'estk-pg';
import PostgresEventStorage from '../src/event_storage';
import { TestSuites } from 'estk-events';

describe('with postgresql storage', () => {
  const config = {
    url: process.env.DATABASE_URL_TEST || '',
    poolSize: 10
  };

  const startStore = async () => {
    const client = await PostgresClient(config);
    const storage: any = await PostgresEventStorage(client);
    await storage.createSchema();
    await storage.deleteAll();
    return createEventStore({
      storage
    });
  };

  TestSuites.storage(startStore);
});
