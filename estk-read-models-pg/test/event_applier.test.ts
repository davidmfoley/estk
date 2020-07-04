import getEventApplier from '../src/event_applier';

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { ReadModelConfig } from '../src/types';

describe('getEventApplier', () => {
  let readModel: ReadModelConfig;
  let invoked: boolean;
  let applier: ReturnType<typeof getEventApplier>;

  beforeEach(() => {
    invoked = false;

    readModel = {
      name: 'example',
      version: 0,
      fields: {},
      events: {
        thing: {
          action: async (event, actions) => {
            invoked = true;
          },
        },
      },
    };
    const context = { query: {} as any };
    applier = getEventApplier(readModel, context);
  });

  it('returns a no-op for unhandled event', async () => {
    const unhandledEvent = {
      id: 1,
      targetType: 'unhandled',
      targetId: 'bogus',
      action: 'action',
      data: {},
      meta: {},
      timestamp: '1234',
    };
    applier(unhandledEvent);
  });

  it('can invoke a matching handler', async () => {
    const handledEvent = {
      id: 1,
      targetType: 'thing',
      targetId: 'id',
      action: 'action',
      data: {},
      meta: {},
      timestamp: '1234',
    };
    const context = { query: {} as any };
    const applier = getEventApplier(readModel, context);
    await applier(handledEvent);
    expect(invoked).to.eq(true);
  });
});
