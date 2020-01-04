import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { PostgresClient } from 'estk-pg';
import PostgresSnapshotStorage from '../src/snapshot_storage';
import { EventStreamBookmark } from 'estk-events';
import { DatabaseClient } from 'estk-pg/lib/types';

describe('pg snapshot storage', () => {
  let client: DatabaseClient;
  let snapshotStorage: any;

  beforeEach(async () => {
    client = await PostgresClient({
      url: process.env.DATABASE_URL_TEST || '',
    });
    snapshotStorage = PostgresSnapshotStorage({
      client,
      tableName: 'snapshot_test_' + Date.now(),
    });
  });

  afterEach(() => client.close());

  it('can get on an empty stomach', async () => {
    const result = await snapshotStorage.get('42');
    expect(result.notFound).to.eq(true);
  });

  it('can put then get', async () => {
    const state = {
      id: '42',
      name: 'Arthur',
      occupation: 'sandwich artisan',
    };
    const bookmark: EventStreamBookmark = {
      id: 'example',
      timestamp: '122345',
    };
    await snapshotStorage.put('42', {
      state,
      bookmark,
    });
    const fetched = await snapshotStorage.get('42');
    expect(fetched.notFound).not.to.be.ok;
    expect(fetched.state).to.eql(state);
    expect(fetched.bookmark).to.eql(bookmark);
  });

  it('can put twice then get', async () => {
    await snapshotStorage.put('42', {
      state: {
        name: 'Arthur',
        occupation: 'Earthling',
      },
      bookmark: {
        id: '1',
        timestamp: '123',
      },
    });
    const state = {
      name: 'Arthur',
      occupation: 'Space Traveler',
    };
    const bookmark: EventStreamBookmark = {
      id: '4',
      timestamp: '343439',
    };
    await snapshotStorage.put('42', {
      state,
      bookmark,
    });
    const fetched = await snapshotStorage.get('42');
    expect(fetched.notFound).not.to.be.ok;
    expect(fetched.state).to.eql(state);
    expect(fetched.bookmark).to.eql(bookmark);
  });
});
