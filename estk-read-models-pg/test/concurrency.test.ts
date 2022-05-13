import { describe, beforeEach, it } from 'mocha'
import { expect } from 'chai'
import { createEventStore, EventStore } from 'estk-events'
import { PostgresClient, DatabaseClient } from 'estk-pg'
import { cleanDatabase } from './helpers'
import ReadModels from '../src/read_models'
import sandwich from './models/sandwich'
import PostgresEventStorage from 'estk-events-pg/src/event_storage'

describe('PG read models with PG event store', () => {
  let client: DatabaseClient, readModels: any, eventStore: EventStore

  beforeEach(async () => {
    await cleanDatabase()
    client = await PostgresClient({
      url: process.env.DATABASE_URL_TEST || '',
    })
  })

  afterEach(async () => {
    await client.close()
  })

  describe('transactional', () => {
    let eventStorage
    beforeEach(async () => {
      eventStorage = await PostgresEventStorage(client)

      eventStore = await createEventStore({
        storage: eventStorage,
      })

      readModels = await ReadModels({
        eventStore,
        client,
        models: {
          sandwich,
        },
        options: {
          rebuildOnStart: true,
        },
      })

      //await readModels.rebuildAll();

      eventStore.onPublished(readModels.applyEvents)
    })
  })
})
