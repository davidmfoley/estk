import { EventStore, Event } from 'estk-events';
import { DatabaseClient, DatabaseQuery, ResultSet } from 'estk-pg';

export type PostgresReadModel = {};

export type ReadModelLookup = string | string[] | Object;

export type ReadModelActions = {
  get: (lookup: ReadModelLookup) => Promise<any>;
  getAll: (lookup: ReadModelLookup) => Promise<any[]>;
  create: (id: string, data: Object) => Promise<void>;
  merge: (lookup: ReadModelLookup, fieldsToMerge: any) => Promise<void>;
  update: (id: string, data: any) => Promise<void>;
  createOrMerge: (id: string, data: any) => Promise<void>;
  createOrReplace: (id: string, data: any) => Promise<void>;
  delete: (lookup: ReadModelLookup) => Promise<void>;
};

export type ReadModelsConfig = {
  client: DatabaseClient;
  eventStore: EventStore;
  models: {
    [key: string]: ReadModelConfig;
  };
};

type EventHandler = (
  event: Event,
  actions: ReadModelActions
) => Promise<void>;

type EventHandlerMap = {
  [x: string]: EventHandler
};

type EventHandlerMapMap = {
  [x: string]: EventHandler | EventHandlerMap
}

type ReadModelEventConfig = EventHandler | EventHandlerMapMap;

export type ReadModelConfig = {
  name: string,
  version: number,
  fields: any,
  defaultValue?: any,
  events: ReadModelEventConfig
};

export type ReadModel = any;

export type ReadModels = {
  applyEvents: (events: Event[], context: any) => Promise<void>,
  get: (name: string) => ReadModel,
  update: (name: string) => Promise<void>,
  query: (query: DatabaseQuery) => Promise<ResultSet>
};

export type DatabaseContext = any;
