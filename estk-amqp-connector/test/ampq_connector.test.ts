import { afterEach, beforeEach, describe, it } from 'mocha'
import InMemoryEventStorage from 'estk-events-in-memory'
import { createEventStore } from 'estk-events'
import AmqpMessageBus from '../src/amqp_message_bus'

describe('amqp connector', () => {
  let first: any, second: any
  const exampleEvent = {
    targetType: 'test-type',
    targetId: 'test-id',
    action: 'test-action',
  }

  beforeEach(async () => {
    first = await connect()
    second = await connect()
  })

  afterEach(async () => {
    await first.close()
    await second.close()
  })

  it('relays published events', () => {
    return new Promise(resolve => {
      first.onPublished(resolve)
      second.publish(exampleEvent)
    })
  })

  it('handles locally published events', () => {
    return new Promise(resolve => {
      first.onPublished(resolve)
      first.publish(exampleEvent)
    })
  })

  async function connect() {
    const storage = InMemoryEventStorage()
    const eventStore = await createEventStore({
      storage,
    })
    const bus = await AmqpMessageBus(eventStore, {
      url: process.env.AMQP_URL_TEST,
      exchange: 'estk-amqp-connector-test',
    })
    return {
      close: bus.close,
      publish: eventStore.publish,
      onPublished: bus.onPublished,
    }
  }
})
