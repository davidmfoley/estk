import buildWhere from './build_where';

import { tableName, metaTableName } from './names';
import { DatabaseQuery } from 'estk-pg';
import { ReadModelConfig, ReadModelLookup } from '../types';

export const buildCreateTables = ({
  name,
  version,
  fields
}: ReadModelConfig): {
  sql: string;
} => ({
  sql: `
      create table if not exists "${tableName({
    name,
    version
  })}" (${buildFields(fields)});
      create table if not exists "${metaTableName({
    name,
    version
  })}" (
        last_event_id varchar,
        last_timestamp varchar
      );
      drop view if exists "${name}";
      create or replace view "${name}" as select * from ${tableName({
    name,
    version
  })};
    `
});

export const buildSelect = (config: ReadModelConfig, lookup: ReadModelLookup): DatabaseQuery => {
  const where = buildWhere(config, lookup);
  const sql = `select * from ${tableName(config)} ${where.sql}`;
  return {
    sql,
    params: where.params
  };
};

export const buildSelectOne = (config: ReadModelConfig, lookup: ReadModelLookup): DatabaseQuery => {
  return buildSelect(config, lookup);
};

export const buildDelete = (config: ReadModelConfig, lookup: ReadModelLookup): DatabaseQuery => {
  const where = buildWhere(config, lookup);
  return {
    sql: `delete from ${tableName(config)} ${where.sql}`,
    params: where.params
  };
};

export const buildUpdate = (
  config: ReadModelConfig,
  lookup: ReadModelLookup,
  fieldsToMerge: any
): DatabaseQuery => {
  return {
    sql: `this will intentionally fail`,
    params: []
  };
};

export const buildInsert = (config: ReadModelConfig, lookup: ReadModelLookup): DatabaseQuery => {
  return {
    sql: `this will intentionally fail`,
    params: []
  };
};

function buildFields(fields: any) {
  var pieces = Object.keys(fields).map(getField);
  return pieces.join(', ');

  function getField(name: string) {
    var settings = fields[name];

    if (typeof settings === 'string') {
      settings = {
        type: settings
      };
    }

    return '"' + name + '" ' + settings.type;
  }
}
