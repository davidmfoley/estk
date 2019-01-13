import { ReadModelConfig, ReadModelActions, ReadModelLookup } from '../types';
import { QueryContext, DatabaseQuery } from 'estk-pg';

import {
  buildSelectOne,
  buildSelect,
  buildDelete,
  buildUpdate,
  buildInsert
} from '../queries';

export default ((config: ReadModelConfig, {
  query
}: QueryContext): ReadModelActions => {

  const doQuery = (q: DatabaseQuery): Promise<any[]> => query(q);

  return {
    get: async (lookup: ReadModelLookup) => {
      const result = await doQuery(buildSelectOne(config, lookup));
      return result.length ? result[0] : config.defaultValue;
    },
    getAll: async (lookup: ReadModelLookup) => {
      return await doQuery(buildSelect(config, lookup));
    },
    create: async (data: Object) => {
      await doQuery(buildInsert(config, data));
    },
    merge: async (lookup: ReadModelLookup, fieldsToMerge: Object) => {
      await doQuery(buildUpdate(config, lookup, fieldsToMerge));
    },
    delete: async (lookup: ReadModelLookup) => {
      await doQuery(buildDelete(config, lookup));
    },
    update: (id: string, data: any): Promise<void> => {
      throw new Error('not implemented');
    },
    createOrMerge: (id: string, data: any) => {
      throw new Error('not implemented');
    },
    createOrReplace: (id: string, data: any) => {
      throw new Error('not implemented');
    }
  };
});
