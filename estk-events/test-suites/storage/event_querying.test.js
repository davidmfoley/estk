// @flow weak
import { describe, beforeEach, it } from 'mocha';

const expect: any = require('chai').expect;

module.exports = (startStore) => {
  let store;

  describe('querying for events', () => {
    beforeEach(async () => {
      store = await startStore();
      await store.publish('cyborg', 'A', 'create', {name: 'Sy'});
      await store.publish('cyborg', 'B', 'create', {name: 'Borg'});
      await store.publish('cyborg', 'A', 'update', {name: 'Cy'});

      await store.publish('android', 'A', 'create', {name: 'Andy'});
      await store.publish('android', 'B', 'create', {name: 'Roid'});
      await store.publish('android', 'B', 'delete', {});
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

  async function readAll(stream) {
    const events = [];
    let event = 1;

    while(!event.ended) {
      event = await stream.next();
      if (!event.ended) events.push(event);
    }

    return events;
  }
};

