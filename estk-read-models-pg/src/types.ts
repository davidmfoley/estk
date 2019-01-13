import { EventStore, Event } from 'estk-events';
import { DatabaseClient, DatabaseQuery, ResultSet } from 'estk-pg';

export type PostgresReadModel = {};

export type ReadModelLookup = string | string[] | Object;

export type ReadModelActions = {
  get: (lookup: ReadModelLookup) => Promise<Object>;
  getAll: (lookup: ReadModelLookup) => Promise<Object[]>;
  create: (id: string, data: Object) => Promise<void>;
  merge: (lookup: ReadModelLookup, fieldsToMerge: Object) => Promise<void>;
  update: (id: string, data: Object) => Promise<void>;
  createOrMerge: (id: string, data: Object) => Promise<void>;
  createOrReplace: (id: string, data: Object) => Promise<void>;
  delete: (lookup: ReadModelLookup) => Promise<void>;
};

export type ReadModelsConfig = {
  client: DatabaseClient;
  eventStore: EventStore;
  models: {
    [key: string]: ReadModelConfig;
  };
};

export type ReadModelConfig = {
  name: string,
  version: number,
  fields: any,
  defaultValue?: any
};

export type ReadModel = any;

export type ReadModels = {
  applyEvents: (events: Event[], context: any) => Promise<void>,
  get: (name: string) => ReadModel,
  update: (name: string) => Promise<void>,
  query: (query: DatabaseQuery) => Promise<ResultSet>
};

export type DatabaseContext = any;
