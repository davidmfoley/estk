import Debug from 'debug';
import { DatabaseTransaction, DatabaseQuery, ResultSet } from './types';
import { Pool, PoolClient, QueryResult, QueryArrayResult } from 'pg';
import wrapQuery from './wrap_query';

const debug = Debug('estk-pg.transaction');

export default function PostgresTransaction(txPool: Pool): Promise<DatabaseTransaction> {
  const buildQueryResult = (pgResult: QueryResult): ResultSet => {
    return pgResult.rows;
  };

  return new Promise((resolve, reject) => {
    txPool.connect((
      err: Error | undefined,
      client: PoolClient,
      done: (err: any) => void
    ) => {
      if (err) {
        return reject(err);
      }

      const wrappedQuery = wrapQuery(client.query.bind(client), debug);

      function commit(): Promise<any> {
        return wrappedQuery({ sql: 'COMMIT;' });
      }

      function rollback(): Promise<any> {
        return wrappedQuery({ sql: 'ROLLBACK;' });
      }

      function query({
        sql,
        params = []
      }: DatabaseQuery): Promise<ResultSet> {
        return wrappedQuery({sql, params}).catch(
          (err: Error) => {
          return rollback().then(() => {
            throw new Error(`SQL Error in transaction: ${err.message}\n${sql}`);
          });
        });
      }

      wrappedQuery({ sql: 'BEGIN;'}).then(() => (
        resolve({
          query,
          commit,
          rollback
        })
      ), reject);
    });
  });
}
