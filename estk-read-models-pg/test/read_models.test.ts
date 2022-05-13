import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { createEventStore, EventStore } from 'estk-events';
import { PostgresClient, DatabaseClient } from 'estk-pg';
import { cleanDatabase } from './helpers';
import ReadModels from '../src/read_models';
import sandwich from './models/sandwich';
import { PostgresEventStorage } from 'estk-events-pg';

describe('PG read models with PG event store', () => {
  let client: DatabaseClient, readModels: any, eventStore: EventStore;

  beforeEach(async () => {
    await cleanDatabase();
    client = await PostgresClient({
      url: process.env.DATABASE_URL_TEST || '',
    });
  });

  afterEach(async () => {
    await client.close();
  });

  describe('transactional', () => {
    let eventStorage;
    beforeEach(async () => {
      eventStorage = await PostgresEventStorage(client);

      eventStore = await createEventStore({
        storage: eventStorage,
      });

      readModels = await ReadModels({
        eventStore,
        client,
        models: {
          sandwich,
        },
        options: {
          rebuildOnStart: true,
        },
      });

      eventStore.onPublished(readModels.applyEvents);
    });

    describe('when empty', () => {
      it('sets up a queryable table', async () => {
        const result = await readModels.query({
          sql: 'select * from sandwich',
        });
        expect(result).to.eql([]);
      });

      it('returns an empty set upon #getAll', async () => {
        const result = await readModels.get('sandwich').getAll();
        expect(result).to.eql([]);
      });

      it('returns a count of 0', async () => {
        const result = await readModels.get('sandwich').count();
        expect(result).to.eq(0);
      });
    });

    describe('on create', () => {
      beforeEach(async () => {
        await eventStore.publish({
          targetType: 'sandwich',
          targetId: '42',
          action: 'make',
          data: { meat: 'roast beast', bread: 'rye' },
        });
      });

      it('can fetch all', async () => {
        const results = await readModels.get('sandwich').getAll({});
        expect(results.length).to.eql(1);
        const [result] = results;
        expect(result.meat).to.eq('roast beast');
        expect(result.bread).to.eq('rye');
      });

      it('sets up a queryable table', async () => {
        const result = await readModels.query({
          sql: 'select * from sandwich_0',
        });
        expect(result.length).to.eql(1);
      });

      it('returns a count of 1', async () => {
        const result = await readModels.get('sandwich').count();
        expect(result).to.eq(1);
      });
    });
  });
});
