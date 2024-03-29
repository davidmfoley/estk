import { describe, it } from 'mocha'
import OnDemandModel from '../src/on_demand_model'
import { expect } from 'chai'
import { createEventStore } from 'estk-events'
import InMemoryEventStorage from 'estk-events-in-memory'

describe('on-demand read models', () => {
  const Sandwich = OnDemandModel({
    eventFilter: id => ({
      sandwich: {
        id,
      },
    }),
    initialState: {
      meat: 'none',
      bread: 'none',
      hit_points: 0,
    },
    reducer: {
      sandwich: {
        make: (_, { targetId, data }: any) => ({
          id: targetId,
          meat: data.meat,
          bread: data.bread,
          hit_points: 4,
        }),
        bite: sandwich => {
          if (sandwich.hit_points === 1) {
            return null
          }

          return Object.assign({}, sandwich, {
            hit_points: sandwich.hit_points - 1,
          })
        },
      },
    },
  })

  it('returns initialState if no events', async () => {
    const store = await exampleEventStore([])
    const sandwich = (await Sandwich(store).get('42')).state
    expect(sandwich.bread).to.eq('none')
  })

  it('reduces state from events', async () => {
    const store = await exampleEventStore([
      {
        targetType: 'sandwich',
        targetId: '42',
        action: 'make',
        data: {
          meat: 'roast beast',
          bread: 'rye',
        },
      },
      {
        targetType: 'sandwich',
        targetId: '42',
        action: 'sell',
        data: {},
      },
      {
        targetType: 'sandwich',
        targetId: '42',
        action: 'bite',
      },
    ])
    const sandwich = (await Sandwich(store).get('42')).state
    expect(sandwich.meat).to.eq('roast beast')
    expect(sandwich.bread).to.eq('rye')
    expect(sandwich.hit_points).to.eq(3)
  })

  it('can update an existing model state with new events', async () => {
    const existing = {
      id: '42',
      meat: ' chicken',
      bread: ' wheat',
      hit_points: 2,
    }
    const store = await exampleEventStore([
      {
        targetType: 'sandwich',
        targetId: '42',
        action: 'bite',
      },
      {
        targetType: 'sandwich',
        targetId: '43',
        action: 'bite',
      },
    ])
    const exampleBookmark = { timestamp: '12345', id: '123' }
    const sandwich = await Sandwich(store).update({
      id: '42',
      state: existing,
      bookmark: exampleBookmark,
    })
    expect(sandwich.state.hit_points).to.eq(1)
    expect(sandwich.bookmark.id).to.be.ok
    expect(sandwich.bookmark.timestamp).to.be.ok
  })
})
describe('reducer as function', () => {
  const Counter = OnDemandModel({
    eventFilter: id => ({
      sandwich: {
        id,
      },
    }),
    initialState: 0,
    reducer: count => count + 1,
  })

  it('returns initialState if no events', async () => {
    const store = await exampleEventStore([])
    const count = (await Counter(store).get('42')).state
    expect(count).to.eq(0)
  })

  it('reduces state from events', async () => {
    const store = await exampleEventStore([
      {
        targetType: 'sandwich',
        targetId: '42',
        action: 'make',
        data: {
          meat: 'roast beast',
          bread: 'rye',
        },
      },
      {
        targetType: 'sandwich',
        targetId: '42',
        action: 'sell',
        data: {},
      },
      {
        targetType: 'sandwich',
        targetId: '42',
        action: 'bite',
      },
    ])
    const count = (await Counter(store).get('42')).state
    expect(count).to.eq(3)
  })
})

async function exampleEventStore(events: any[]) {
  const store = await createEventStore({
    storage: InMemoryEventStorage(),
  })

  for (let event of events) {
    await store.publish(event)
  }

  return store
}
