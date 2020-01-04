import Debug from 'debug';
import { DatabaseTransaction, DatabaseQuery, ResultSet } from './types';
import { Pool, PoolClient } from 'pg';
import wrapQuery from './wrap_query';

const debug = Debug('estk-pg.transaction');

export default async function PostgresTransaction(
  txPool: Pool
): Promise<DatabaseTransaction> {
  const client = await txPool.connect();
  const wrappedQuery = wrapQuery(client.query.bind(client), debug);

  await wrappedQuery({ sql: 'BEGIN;' });

  const commit = async () => {
    await wrappedQuery({ sql: 'COMMIT;' });
    await client.release();
  };
  const rollback = async () => {
    await wrappedQuery({ sql: 'ROLLBACK;' });
    await client.release();
  };

  return {
    commit,
    rollback,
    query: wrappedQuery,
  };
}
