import { EventStore, Event } from 'estk-events';
import { DatabaseClient, DatabaseQuery, ResultSet } from 'estk-pg';

export type PostgresReadModel = {};

export type ReadModelLookup = string | string[] | Object;

export type ReadModelActions = {
  get: (lookup: ReadModelLookup) => Promise<any>;
  getAll: (lookup: ReadModelLookup) => Promise<any[]>;
  create: (data: Object) => Promise<void>;
  merge: (lookup: ReadModelLookup, fieldsToMerge: any) => Promise<void>;
  delete: (lookup: ReadModelLookup) => Promise<void>;
};

export type ReadModelsConfig = {
  client: DatabaseClient;
  eventStore: EventStore;
  models: {
    [key: string]: ReadModelConfig;
  };
  options: {
    rebuildOnStart?: boolean
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

type ReadModelField = {
  type: string,
  primaryKey?: boolean
}

type ReadModelFields = {
  [name: string]: ReadModelField
}

export type ReadModelConfig = {
  name: string,
  version: number,
  fields: ReadModelFields,
  defaultValue?: any,
  events: ReadModelEventConfig
};

export type ReadModel = any;

export type ReadModels = {
  applyEvents: (events: Event[], context: any) => Promise<void>,
  get: (name: string) => ReadModel,
  update: (name: string) => Promise<void>,
  query: (query: DatabaseQuery) => Promise<ResultSet>,
  rebuildAll: () => Promise<void>
};

export type DatabaseContext = any;

export type EventApplier = (e: Event) => Promise<Event | undefined>
