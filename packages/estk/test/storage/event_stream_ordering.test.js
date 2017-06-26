// @flow weak

const expect: any = require('chai').expect;
const COUNT = 5;

module.exports = (startStore) => {
  let store;

  describe(`reading back ${COUNT} events`, () => {
    beforeEach(() => {
      return startStore().then(store_ => {
        store = store_;
        let promise = Promise.resolve();
        for (let i = 0; i < COUNT; i++) {
          promise = promise.then(() => {
            return store.publish({
              targetType: 'robot',
              targetId: '' + i,
              action: 'create',
              data: {
                index: i
              }
            });
          });
        }
        return promise;
      });
    });

    it('can stream back all of the events', async () => {
      let stream = await store.getEventStream();

      let beforeAll = await stream.next();

      expect(beforeAll.targetType).to.eq('$global');
      expect(beforeAll.action).to.eq('$before');

      for (let i = 0; i < COUNT; i++) {
        let e = await stream.next();
        if (!e) throw new Error('NO event found at index ' + i);
        expect(e.data.index).to.eq(i);
        expect(e.targetType).to.eq('robot');
        expect(e.targetId).to.eq('' + i);
        expect(e.action).to.eq('create');
      }

      const eof = await stream.next();
      expect(eof).to.eq(null);
    });
  });
};
