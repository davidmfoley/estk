// @flow weak
import { describe } from 'mocha';

import { EventStore } from 'estk-events';
import InMemoryStorage from '../src';
import storageTests from 'estk-events/test-suites/storage';

describe('with in-memory storage', () => {
  const startStore = () => {
    return EventStore({
      storage: InMemoryStorage()
    })
  };

  storageTests(startStore);
});

