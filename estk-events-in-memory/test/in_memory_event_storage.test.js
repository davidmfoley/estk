// @flow
import { describe, it } from 'mocha';
import { expect } from 'chai';

import { EventStore } from 'estk-events';
import InMemoryStorage from '../src';
import storageTests from 'estk-events/test-suites/storage';

describe('with in-memory storage', () => {
  const startStore = () => {
    return EventStore({
      storage: InMemoryStorage()
    })
  };

  storageTests(startStore);
  it('can reduce', async () => {
    const store = await startStore();
    await store.publish({targetType: 'number', targetId: '', data: { value: 4} });
    await store.publish({targetType: 'number', targetId: '', data: { value: 6} });
    await store.publish({targetType: 'number', targetId: '', data: { value: 3} });

    const stream = await store.getEventStream({});
    const sum = await stream.reduce((sum, {data}) => data.value + sum, 0);
    expect(sum).to.eq(13);
  });
});

