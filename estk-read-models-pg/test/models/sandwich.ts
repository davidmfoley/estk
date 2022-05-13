import { Event } from 'estk-events'
import { ReadModelConfig, ReadModelActions } from '../../src/types'

const Sandwich: ReadModelConfig = {
  name: 'sandwich',
  version: 0,
  fields: {
    id: {
      type: 'text',
      primaryKey: true,
    },
    meat: {
      type: 'text',
    },
    bread: {
      type: 'text',
    },
    hitPoints: {
      type: 'int',
    },
  },
  events: {
    sandwich: {
      make: async (event: Event, actions: ReadModelActions) => {
        const { meat, bread } = event.data
        await actions.create({
          id: '42',
          meat,
          bread,
          hitPoints: 4,
        })
      },
      bite: async (event: Event, actions: ReadModelActions) => {
        const sandwich = await actions.get(event.targetId)

        if (!sandwich) return

        if (sandwich.hitPoints === 1) {
          await actions.delete(event.targetId)
        } else {
          await actions.merge(event.targetId, {
            hitPoints: sandwich.hitPoints - 1,
          })
        }
      },
    },
  },
}

export default Sandwich
