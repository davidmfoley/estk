// @flow weak
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import EventStore from '../src/event_store';

describe('publishing an event', () => {
  let store;

  beforeEach(async () => {
    store = await EventStore({
      storage: {
        publish: (e, onPublished) => {
          onPublished(e);
          Promise.resolve(e);
        },
        close: () => Promise.resolve(),
        getEventStream: () => Promise.resolve(({}: any))
      }
    })
  });

  it('invokes onPublished handlers', () => {
    const publishRequest = {
      targetType: 'book',
      action: 'create',
      targetId: '42',
      data: {name: 'foo'}
    };

    return new Promise(resolve => {
      store.onPublished((events) => {
        expect(events.length).to.eq(1);
        expect(events[0].action).to.eq('create');
        resolve()
      });

      store.publish(publishRequest);
    });
  });
});

