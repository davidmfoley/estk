import { DatabaseClient, PostgresClient } from 'estk-pg';
import sandwich from './models/sandwich';
import rebuild from '../src/rebuild';
import { createEventStore } from 'estk-events';
import InMemoryEventStorage from 'estk-events-in-memory';
import { expect } from 'chai';

describe('rebuild', () => {
  let client: DatabaseClient;
  beforeEach(async () => {
    client = await PostgresClient({
      url: process.env.DATABASE_URL_TEST || ''
    });
  });

  describe('with no existing state', () => {
    describe('with no events', () => {
      it('results in an empty table', async () => {
        const eventStore = await createEventStore({ storage: InMemoryEventStorage() });
        await rebuild({ model: sandwich, client, eventStore });
        const result = await client.query({sql: 'select * from sandwich_0'});
        expect(result.length).to.eq(0);
      });
    });

    describe('with some events', () => {
      it('results in an empty table', async () => {
        const eventStore = await createEventStore({ storage: InMemoryEventStorage() });
        await eventStore.publish([
        ]);

        await rebuild({ model: sandwich, client, eventStore });
        const result = await client.query({sql: 'select * from sandwich_0'});
        expect(result.length).to.eq(0);
      });
    });
  });
});
