import Debug from 'debug';
import { DatabaseTransaction } from './types';
import { Pool } from 'pg';
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
    client.release();
  };

  const rollback = async () => {
    await wrappedQuery({ sql: 'ROLLBACK;' });
    client.release();
  };

  return {
    commit,
    rollback,
    query: wrappedQuery,
  };
}
