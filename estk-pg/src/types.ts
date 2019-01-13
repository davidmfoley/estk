export type ResultRow = any;
export type ResultSet = Array<ResultRow>;

export type DatabaseQuery = {
  sql: string;
  params?: Array<any>;
};

type QueryAction = (query: DatabaseQuery) => Promise<ResultSet>;

export type QueryContext = {
  query: QueryAction;
};

export type DatabaseTransaction = {
  query: QueryAction;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
};

export type DatabaseClient = {
  query: QueryAction;
  transaction: () => Promise<DatabaseTransaction>;
};
