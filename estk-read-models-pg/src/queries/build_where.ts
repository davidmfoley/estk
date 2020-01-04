import { ReadModelConfig } from '../types';
import { tableName } from './names';
import { DatabaseQuery } from 'estk-pg/lib';

const buildWhere = (config: ReadModelConfig, where: any = {}): any => {
  const keys = Object.keys(where || {});

  if (!keys.length) {
    return {
      sql: '',
      params: [],
    };
  }

  const pieces = keys.map(key => buildWherePiece(config, key, where[key]));

  return combinePieces(pieces);
};

function combinePieces(pieces: DatabaseQuery[]) {
  let offset = 0;
  let params: any[] = [];

  const sqlPieces = pieces.map(piece => {
    params = params.concat(piece.params);
    const paramCount = piece.params ? piece.params.length : 0;
    const pieceSql = offsetParameterIndexes(piece.sql, offset, paramCount);
    offset += paramCount;
    return pieceSql;
  });

  return {
    sql: `where ${sqlPieces.join(' and ')}`,
    params,
  };
}

function offsetParameterIndexes(clause: string, offset: number, count: number) {
  if (offset === 0) return clause;

  for (var i = count; i > 0; i--) {
    let paramMatcher = new RegExp(`\\$${i}`, 'g');
    let replacement = `$${i + offset}`;
    clause = clause.replace(paramMatcher, replacement);
  }

  return clause;
}

function buildWherePiece(
  config: ReadModelConfig,
  field: string,
  value: any
): DatabaseQuery {
  return {
    sql: `${escapeFieldName(config, field)}=$1`,
    params: [value],
  };
}

function escapeFieldName(config: ReadModelConfig, name: string): string {
  return `"${tableName(config)}"."${name}"`;
}

export default buildWhere;
