import buildWhere from './build_where'

import { tableName, metaTableName } from './names'
import { DatabaseQuery } from 'estk-pg'
import { ReadModelConfig, ReadModelLookup } from '../types'

export const buildCreateTables = ({
  name,
  version,
  fields,
}: ReadModelConfig): {
  sql: string
} => ({
  sql: `
      create table if not exists "${tableName({
        name,
        version,
      })}" (${buildFields(fields)});
      create table if not exists "${metaTableName({
        name,
        version,
      })}" (
        last_event_id varchar,
        last_timestamp varchar
      );
      drop view if exists "${name}";
      create or replace view "${name}" as select * from ${tableName({
    name,
    version,
  })};
    `,
})

export const buildEmptyTables = ({
  name,
  version,
  fields,
}: ReadModelConfig): {
  sql: string
} => ({
  sql: `
      delete from "${tableName({
        name,
        version,
      })}";
      delete from "${metaTableName({
        name,
        version,
      })}";
    `,
})

export const buildCreateTempTable = (
  { fields }: ReadModelConfig,
  name: string
): {
  sql: string
} => ({
  sql: `
      create table if not exists "${name}" (${buildFields(fields)});
    `,
})

export const copyFromTempTable = (
  config: ReadModelConfig,
  sourceTableName: string
): DatabaseQuery => ({
  sql: `
      insert into ${tableName(config)} select * from ${sourceTableName};
    `,
})

export const buildSelectCount = (
  config: ReadModelConfig,
  lookup: ReadModelLookup
): DatabaseQuery => {
  const where = buildWhere(config, lookup)
  const sql = `select count(*) from ${tableName(config)} ${where.sql}`
  return {
    sql,
    params: where.params,
  }
}

export const buildSelect = (
  config: ReadModelConfig,
  lookup: ReadModelLookup
): DatabaseQuery => {
  const where = buildWhere(config, lookup)
  const sql = `select * from ${tableName(config)} ${where.sql}`
  return {
    sql,
    params: where.params,
  }
}

export const buildSelectOne = (
  config: ReadModelConfig,
  lookup: ReadModelLookup
): DatabaseQuery => {
  return buildSelect(config, lookup)
}

export const buildDelete = (
  config: ReadModelConfig,
  lookup: ReadModelLookup
): DatabaseQuery => {
  const where = buildWhere(config, lookup)
  return {
    sql: `delete from ${tableName(config)} ${where.sql}`,
    params: where.params,
  }
}

export const buildUpdate = (
  config: ReadModelConfig,
  lookup: ReadModelLookup,
  fieldsToMerge: any
): DatabaseQuery => {
  return {
    sql: `this will intentionally fail`,
    params: [],
  }
}

type NameAndValue = { name: string; value: string }

const columnNames = (fieldValues: NameAndValue[]): string =>
  fieldValues.map(({ name }) => `"${name}"`).join(', ')
const tokens = (fieldValues: NameAndValue[], offset: number = 0): string =>
  fieldValues.map((x, i) => `$${i + offset + 1}`).join(', ')
const queryParams = (fieldValues: NameAndValue[]): any[] =>
  fieldValues.map(({ value }: NameAndValue) => value)

export const buildInsert = (
  config: ReadModelConfig,
  fields: any
): DatabaseQuery => {
  let fieldValues: NameAndValue[] = []

  for (let name of Object.keys(fields)) {
    const field = config.fields[name]
    if (field) {
      const value = fields[name]
      fieldValues.push({
        name,
        value,
      })
    }
  }

  const params = queryParams(fieldValues)

  return {
    sql: `insert into ${tableName(config)} (${columnNames(
      fieldValues
    )}) values (${tokens(fieldValues)})`,
    params,
  }
}

function buildFields(fields: any) {
  var pieces = Object.keys(fields).map(getField)
  return pieces.join(', ')

  function getField(name: string) {
    var settings = fields[name]

    if (typeof settings === 'string') {
      settings = {
        type: settings,
      }
    }

    return '"' + name + '" ' + settings.type
  }
}
