// @flow
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { PostgresClient } from 'estk-pg';
import ReadModels from '../src/read_models';
import Sandwich from './models/sandwich';
import PostgresEventStorage from 'estk-events-pg/src/event_storage';

describe('PG read models', () => {
  let client, readModels;
  beforeEach(async () => {
    client = await PostgresClient({
      url: process.env.DATABASE_URL_TEST || ''
    });
  });

  describe('', () => {
    let eventStorage;
    beforeEach(async () => {
      eventStorage = PostgresEventStorage(client);

      readModels = await ReadModels({
        client,
        eventSource: eventStorage,
        models: [
          Sandwich 
        ]
      });

      readModels.addPollingEventSource(eventStore);
      readModels.subscribe(eventSource);


      await readModels.updateAll();



    });
  });
});
