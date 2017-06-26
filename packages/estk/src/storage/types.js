// @flow

export type ResultRow = Object
export type ResultSet = Array<ResultRow>

type QueryAction = (sql: string, params?: Array<any>) => Promise<ResultSet>

export type DatabaseTransaction = {
  query: QueryAction,
  commit: () => Promise<void>,
  rollback: () => Promise<void>
}

export type DatabaseClient = {
  query: QueryAction
}

