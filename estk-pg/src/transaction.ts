import { DatabaseTransaction, DatabaseQuery, ResultSet } from './types';
import { Pool, PoolClient, QueryResult, QueryArrayResult } from 'pg';

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

      function commit(): Promise<any> {
        return client.query('COMMIT;');
      }

      function rollback(): Promise<any> {
        return client.query('ROLLBACK;');
      }

      function query({
        sql,
        params = []
      }: DatabaseQuery): Promise<ResultSet> {
        return client.query(sql, params).then(
          buildQueryResult,
          (err: Error) => {
          return rollback().then(() => {
            throw err;
          });
        });
      }

      client.query('BEGIN;', function (err) {
        if (err) {
          done(err);
          return reject(err);
        }

        resolve({
          query,
          commit,
          rollback
        });
      });
    });
  });
}
