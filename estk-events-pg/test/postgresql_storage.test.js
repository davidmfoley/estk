// @flow
import { describe } from 'mocha';

import {EventStore} from 'estk-events';
import PostgresClient from '../src/client';
import PostgresEventStorage from '../src/event_storage';
import storageTests from 'estk-events/test-suites/storage';

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
    return EventStore({ storage });
  };

  storageTests(startStore);
});
