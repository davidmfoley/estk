import buildWhere from './build_where';
import { tableName, metaTableName }  from './names';

export const buildCreateTables = (
  {name, version, fields}: ReadModelConfiig
): { sql: string } => (
  {
    sql: `
      create table if not exists "${tableName({name, version})}" (${buildFields(fields)});
      create table if not exists "${metaTableName({name, version})}" (
        last_event_id varchar,
        last_timestamp varchar
      );
      drop view if exists "${name}";
      create or replace view "${name}" as select * from ${tableName({name, version})};
    `
  }
);

export const buildSelectOne = (
  config: ReadModelConfig,
  lookup: ReadModelLookup
): ReadModelQuery => {
  const where = buildWhere(config, lookup);
  const sql = `select * from ${tableName(config)} ${where.sql}`;
  return { sql, params: where.params };
}


function buildFields(fields: any) {
  var pieces = Object.keys(fields).map(getField);
  return pieces.join(', ');

  function getField(name) {
    var settings = fields[name];
    if (typeof settings === 'string') {
      settings = {type: settings};
    }
    return '"' + name +'" ' + settings.type;
  }
}
