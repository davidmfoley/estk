// @flow weak
import { describe } from 'mocha';

import EventStore from '../../src/event_store';
import InMemoryStorage from '../../src/storage/in_memory';
import storageTests from './storage_tests.js';

describe('with in-memory storage', () => {
  const startStore = () => {
    return EventStore({
      storage: InMemoryStorage()
    })
  };

  storageTests(startStore);
});

