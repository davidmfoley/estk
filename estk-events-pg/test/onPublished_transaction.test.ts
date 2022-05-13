import { describe, it } from 'mocha'
import { createEventStore } from 'estk-events'
import { PostgresClient } from 'estk-pg'
import PostgresEventStorage from '../src/event_storage'

describe('onPublished', () => {
  it('rolls back on error', async () => {})

  it('commits if no errors', async () => {})
})
