// @flow

import type { ReadModelConfig } from '../types';
import { tableName }  from './names';

const buildWhere = (
  config: ReadModelConfig,
  where: Object = {}
): any => {
  const keys = Object.keys(where || {});
  if (!keys.length) {
    return {
      sql: '',
      params: []
    }
  }
  const pieces = keys.map(key => buildWherePiece(config, key, where[key]))
  return combinePieces(pieces);

};

function combinePieces(pieces: Object[]) {
  let offset = 0;
  let params = [];

  const sqlPieces= pieces.map(piece => {
    params = params.concat(piece.params);
    let pieceSql =  offsetParameterIndexes(piece.sql, offset, piece.params.length);
    offset += piece.params.length;
    return pieceSql;
  });

  return {
    sql: `where ${sqlPieces.join(' and ')}`,
    params
  };
}

function offsetParameterIndexes(clause, offset, count) {
  if (offset === 0) return clause;
  for (var i = count ; i > 0; i--) {
    let paramMatcher = new RegExp(`\\$${i}`, 'g');
    let replacement = `$${i + offset}`;

    clause = clause.replace(paramMatcher, replacement);
  }
  return clause;
}

function buildWherePiece(config, field, value) {
  return { 
    sql: `${escapeFieldName(config, field)}=$1`,
    params: [value]
  };
}

function escapeFieldName(config, name) {
  return `"${tableName(config)}"."${name}"`;
}

export default buildWhere;
