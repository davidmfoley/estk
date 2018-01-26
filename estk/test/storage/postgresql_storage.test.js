// @flow
import { describe } from 'mocha';

import EventStore from '../../src/event_store';
import PostgresClient from '../../src/storage/pg/client';
import PostgresEventStorage from '../../src/storage/pg/event_storage';
import storageTests from './storage_tests.js';

describe('with postgresql storage', () => {
  const config = {
    url: process.env.DATABASE_URL_TEST || '',
    poolSize: 10
  };

  const startStore = async () => {
    const client = await PostgresClient(config);
    const storage = await PostgresEventStorage(client);
    await storage.createSchema();
    await storage.deleteAll();
    return EventStore({ storage });
  };

  storageTests(startStore);
});
