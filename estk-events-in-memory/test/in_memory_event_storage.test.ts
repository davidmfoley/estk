import { describe, it } from 'mocha'
import { expect } from 'chai'
import { createEventStore, EventStore, EventStream } from 'estk-events'
import InMemoryStorage from '../src'
import { TestSuites } from 'estk-events'

describe('with in-memory storage', () => {
  const startStore = () => {
    return createEventStore({
      storage: InMemoryStorage(),
    })
  }

  TestSuites.storage(startStore)

  it('can reduce', async () => {
    const store: EventStore = await startStore()
    await store.publish({
      action: '',
      targetType: 'number',
      targetId: '',
      data: {
        value: 4,
      },
    })

    await store.publish({
      action: '',
      targetType: 'number',
      targetId: '',
      data: {
        value: 6,
      },
    })

    await store.publish({
      action: '',
      targetType: 'number',
      targetId: '',
      data: {
        value: 3,
      },
    })

    const stream: EventStream = await store.getEventStream({})

    const sum = await stream.reduce(
      (sum: any, { data }: any) => data.value + sum,
      0
    )

    expect(sum.state).to.eq(13)
  })
})
