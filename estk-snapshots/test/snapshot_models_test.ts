import { describe, it } from 'mocha';
import { stub } from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

const {
  expect
} = chai;

import SnapshotModel from '../src/snapshot_model';

describe('snapshot models', () => {
  let model: any, storage: any, snapshotExample: any;
  beforeEach(() => {
    model = {
      get: stub(),
      update: stub()
    };
    storage = {
      put: stub(),
      get: stub()
    };
    snapshotExample = SnapshotModel({
      storage,
      model
    });
  });
  describe('getting current state', () => {
    describe('when not in cache, ', () => {
      beforeEach(() => {
        storage.get.resolves({
          notFound: true
        });
        model.get.resolves({
          state: {
            id: '42',
            name: 'arthur'
          },
          bookmark: {}
        });
        storage.put.resolves();
      });
      it('gets the current state', async () => {
        const result = await snapshotExample.get('42');
        expect(result.name).to.eq('arthur');
      });
      it('puts the snapshot into storage', async () => {
        await snapshotExample.get('42');
        expect(storage.put).to.have.been.calledOnce;
      });
    });
    describe('when present in cache, ', () => {
      beforeEach(() => {
        storage.get.resolves({
          bookmark: {},
          state: {
            id: '42',
            name: 'arthur'
          }
        });
        model.get.throws(new Error());
        model.update.resolves({
          state: {
            id: '42',
            name: 'arthur',
            hungry: true
          },
          bookmark: {}
        });
      });
      it('applies subsequent events to get new state', async () => {
        const result = await snapshotExample.get('42');
        expect(result.hungry).to.eq(true);
      });
      it('puts the new snapshot into storage', async () => {
        await snapshotExample.get('42');
        expect(storage.put).to.have.been.calledOnce;
      });
    });
  });
});
