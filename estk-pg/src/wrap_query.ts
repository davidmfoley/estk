import { QueryResult } from 'pg';
import { DatabaseQuery, ResultSet } from './types';

export default (query: Function, debug: Function) => ({
  sql,
  params = [],
}: DatabaseQuery): Promise<ResultSet> => {
  params = params || [];
  let start = Date.now();
  return query(sql, params).then(
    (result: QueryResult) => {
      const elapsed = Date.now() - start;
      debug(sql, elapsed + 'ms', 'success', result.rowCount, 'rows');
      return result.rows;
    },
    (err: Error) => {
      var elapsed = Date.now() - start;
      debug(sql, elapsed + 'ms', 'error', err.message);
      throw new Error(`SQL Error in transaction: ${err.message}\n${sql}`);
    }
  );
};

const buildQueryResult = (pgResult: QueryResult): ResultSet => {
  return pgResult.rows;
};
