import type { Event } from 'estk-events/types';
import type { PostgresReadModelConfig } from '../../src/types';

const Sandwich: PostgresReadModelConfig = {
  name: 'sandwich',
  version: 0,
  updateStrategy: 'on-publish',
  fields: {
    meat: { type: 'text' },
    bread: { type: 'text' },
    hitPoints: { type: 'int' }
  },
  events: {
    sandwich: {
      'make': async (event: Event, actions: ReadModelActions) => {
        const { meat, bread } = event.data;
        await actions.create(event.targetId, {
          meat,
          bread,
          hitPoints: 4
        });
      },
      'bite': async (event: Event, actions: ReadModelActions) => {
        const sandwich = await actions.get(event.targetId);
        if (sandwich.hitPoints === 1) {
          await actions.delete(event.targetId);
        }
        else {
          await actions.merge(event.targetId, {
            hitPoints: sandwich.hitPoints - 1
          });
        }
      }
    }
  }
};

export default Sandwich;
