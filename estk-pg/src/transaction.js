// @flow

import type { DatabaseTransaction, DatabaseQuery, ResultSet } from './types'

module.exports = PostgresTransaction;

function PostgresTransaction(txPool: any): Promise<DatabaseTransaction> {
  return new Promise((resolve, reject) => {
    txPool.connect(function(err: ?Error, client: any, done: (err?: any) => void) {
      if (err) { return reject(err); }

      function commit(): Promise<void> {
        return client.query('COMMIT;');
      }

      function rollback(): Promise<void> {
        return client.query('ROLLBACK;');
      }

      function query({sql, params = []}: DatabaseQuery): Promise<ResultSet> {
        return client.query(sql, params).then(
          result => result && result.rows || undefined,
          err => {
            return rollback().then(() => {
              throw err;
            });
          }
        );
      }

      client.query('BEGIN;', function(err) {
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
