// @flow weak
import { describe, beforeEach, it } from 'mocha';

const expect: any = require('chai').expect;

module.exports = (startStore) => {
  let store;

  describe('publishing an event', () => {
    let event;

    beforeEach(async () => {
      const publishRequest = {
        targetType: 'book',
        action: 'create',
        targetId: '42',
        data: {name: 'foo'}
      };

      store = await startStore();

      event = await store.publish(publishRequest);
    });

    it('yields the event', () => {
      expect(event.targetType).to.eq('book');
      expect(event.action).to.eq('create');
      expect(event.targetId).to.eq('42');
      expect(event.data).to.eql({name: 'foo'});
    });

    it('can stream the event', async () => {
      let stream = await store.getEventStream();

      let event = await stream.next();
      expect(event.targetType).to.eq('$global');
      expect(event.action).to.eq('$before');

      event = await stream.next();
      expect(event.targetType).to.eq('book');
      expect(event.action).to.eq('create');
      expect(event.targetId).to.eq('42');
      expect(event.data).to.eql({name: 'foo'});

      let eof = await stream.next();
      expect(eof.ended).to.eq(true);
      expect(eof.bookmark.id).to.eq(event.id);
      expect(eof.bookmark.timestamp).to.eq(event.timestamp);
    });
  });
};
