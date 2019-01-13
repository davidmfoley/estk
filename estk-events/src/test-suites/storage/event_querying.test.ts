// @flow weak
import { describe, beforeEach, it } from 'mocha';

const expect: any = require('chai').expect;

export default (startStore: any) => {
  let store: any;

  describe('querying for events', () => {
    beforeEach(async () => {
      store = await startStore();
      await store.publish([
        { targetType: 'cyborg', targetId: 'A', action: 'create', data: { name: 'Sy' } },
        { targetType: 'cyborg', targetId: 'B', action: 'create', data: { name: 'Borg' } },
        { targetType: 'cyborg', targetId: 'A', action: 'update', data: { name: 'Cy' } },
        { targetType: 'android', targetId: 'A', action: 'create', data: { name: 'Andy' } },
        { targetType: 'android', targetId: 'B', action: 'create', data: { name: 'Roid' } },
        { targetType: 'android', targetId: 'B', action: 'delete', data: {} },
      ]);
    });

    it('can get a stream of events filtered by type and action', async () => {
      const stream = await store.getEventStream({
        filter: {
          android: { action: ['create', 'delete'] }
        }
      });

      const events = await readAll(stream);
      expect(events.length).to.eq(4);
    });

    it('can get a stream of events filtered by type and action and id', async () => {
      const stream = await store.getEventStream({
        filter: {
          android: { id: 'B', action: 'delete' }
        }
      });

      const events = await readAll(stream);
      expect(events.length).to.eq(2);
      expect(events[0].action).to.eq('$before');
      expect(events[1].action).to.eq('delete');
    });

    it('can get a stream of events filtered by type and id', async () => {
      const stream = await store.getEventStream({
        filter: {
          android: { id: 'B' }
        }
      });

      const events = await readAll(stream);
      expect(events.length).to.eq(3);
      expect(events[0].action).to.eq('$before');
      expect(events[1].action).to.eq('create');
      expect(events[2].action).to.eq('delete');
    });
  });

  async function readAll(stream: any) {
    const events = [];
    let event: any = {};

    while(!event.ended) {
      event = await stream.next();
      if (!event.ended) events.push(event);
    }

    return events;
  }
};

