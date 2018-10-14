// @flow
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { EventStore } from 'estk-events';
import { PostgresClient } from 'estk-pg';
import ReadModels from '../src/read_models';
import Sandwich from './models/sandwich';
import PostgresEventStorage from 'estk-events-pg/src/event_storage';

describe('PG read models with PG event store', () => {
  let client, readModels, eventStore;
  beforeEach(async () => {
    client = await PostgresClient({
      url: process.env.DATABASE_URL_TEST || ''
    });
  });

  describe('transactional', () => {
    let eventStorage;
    beforeEach(async () => {
      eventStorage = PostgresEventStorage(client);
      eventStore = await EventStore({ storage: eventStorage });

      readModels = await ReadModels({
        client,
        models: [
          Sandwich 
        ]
      });

      eventStore.onPublished(readModels.applyEvents);
    });

    it('is empty initially', async () => {
      const result = await readModels.query('select * from sandwich');
      expect(result).to.eql([]);
    });

  });
});
