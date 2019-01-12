// @flow

import { ReadModelConfig, ReadModelActions, ReadModelLookup } from '../types';
import { QueryContext } from 'estk-pg/types';
import { buildSelectOne, buildSelect, buildDelete, buildUpdate, buildInsert } from '../queries';

export default (config: ReadModelConfig, { query }: QueryContext): ReadModelActions => {
  const doQuery = ({sql, params}: Object) => {
    return query(sql, params);
  }

  return {
    get: async (lookup: ReadModelLookup) => {
      const result = await doQuery(buildSelectOne(config, lookup));

      return result[0] || config.defaultValue;
    },

    getAll: async (lookup: ReadModelLookup) => {
      return await doQuery(buildSelect(config, lookup));
    },

    create: async (data: Object) => {
      return await doQuery(buildInsert(config, data));
    },

    merge: async (lookup: ReadModelLookup, fieldsToMerge: Object) => {
      return await doQuery(buildUpdate(config, lookup, fieldsToMerge));
    },

    delete: async (lookup: ReadModelLookup) => {
      await doQuery(buildDelete(config, lookup));
    }
  };
};

