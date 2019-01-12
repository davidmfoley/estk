import type { EventStore} from 'estk-events';

export type PostgresReadModel = {
};

type ReadModelLookup = string | string[] | Object; 

export type ReadModelActions = {
  get: (lookup: ReadModelLookup) => Promise<Object>,
  getAll: (lookup: ReadModelLookup) => Promise<Object[]>,

  create: (id: string, data: Object) => Promise<void>,

  merge: (lookup: ReadModelLookup, fieldsToMerge: Object) => Promise<void>,
  update: (id: string, data: Object) => Promise<void>,

  createOrMerge: (id: string, data: Object) => Promise<void>,
  createOrReplace: (id: string, data: Object) => Promise<void>,

  delete: (lookup: ReadModelLookup) => Promise<void>,
};

export type ReadModelsConfig = {
  client: DatabaseClient,
  eventStore: EventStore,
  models: {
    [key: string]: ReadModelConfig
  }
}

export type ReadModelConfig = {
};
