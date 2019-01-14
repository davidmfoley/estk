import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { createEventStore, EventStore } from 'estk-events';
import { PostgresClient, DatabaseClient } from 'estk-pg';
import ReadModels from '../src/read_models';
import sandwich from './models/sandwich';
import PostgresEventStorage from 'estk-events-pg/src/event_storage';

describe('PG read models with PG event store', () => {

  let client: DatabaseClient, readModels: any, eventStore: EventStore;

  beforeEach(async () => {
    client = await PostgresClient({
      url: process.env.DATABASE_URL_TEST || ''
    });
  });

  describe('transactional', () => {
    let eventStorage;
    beforeEach(async () => {
      eventStorage = await PostgresEventStorage(client);

      eventStore = await createEventStore({
        storage: eventStorage
      });

      readModels = await ReadModels({
        eventStore,
        client,
        models: {
          sandwich
        }
      });

      eventStore.onPublished(readModels.applyEvents);
    });
    describe('when empty', () => {
      it('is empty initially', async () => {
        const result = await readModels.query('select * from sandwich');
        expect(result).to.eql([]);
      });
      it('returns an empty set upon #getAll', async () => {
        const result = readModels.get('sandwich').getAll();
        expect(result).to.eql([]);
      });
      it('returns a count of 0', async () => {
        const result = readModels.get('sandwich').count();
        expect(result).to.eq(0);
      });
    });
  });
});
