import { describe, beforeEach, it } from 'mocha'
import { expect } from 'chai'
import { EventStore, Event } from '../src/types'

import createEventStore from '../src/event_store'

describe('publishing an event', () => {
  let store: EventStore

  beforeEach(async () => {
    store = await createEventStore({
      storage: {
        publish: (e: Event[], onPublished: any) => {
          onPublished(e)
          Promise.resolve(e)
        },
        close: () => Promise.resolve(),
        getEventStream: () => Promise.resolve({} as any),
      } as any,
    })
  })

  it('invokes onPublished handlers', () => {
    const publishRequest = {
      targetType: 'book',
      action: 'create',
      targetId: '42',
      data: {
        name: 'foo',
      },
    }
    return new Promise(resolve => {
      store.onPublished(events => {
        expect(events.length).to.eq(1)
        expect(events[0].action).to.eq('create')
        resolve()
      })
      store.publish(publishRequest)
    })
  })
})
