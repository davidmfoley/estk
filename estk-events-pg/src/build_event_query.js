export default function buildEventQuery(filter, bookmark, chunkSize = 2500) {
  let where = buildWhere(filter);
  let { sql, params } = where;

  if (bookmark && bookmark.timestamp) {
    const { timestamp, id } = bookmark;
    const timestampClause = `(timestamp > $${params.length + 1} OR (timestamp=$${params.length + 1} and id > $${params.length + 2}))`
    params = params.concat([timestamp, id]);

    if (sql) {
      return buildEventSelect(`WHERE ${sql} AND ${timestampClause}`, params, chunkSize);
    }
    else {
      return buildEventSelect(`WHERE ${timestampClause}`, params, chunkSize);
    }
  }
  else {
    if (sql) {
      return buildEventSelect(`WHERE ${sql}`, params, chunkSize);
    }
    else {
      return  buildEventSelect('', [], chunkSize);
    }
  }
}

function buildWhere(filter) {
  if (!filter) return {sql: '', params: []};
  let pieces = [];
  let params = [];
  let targetTypes = Object.keys(filter);
  if (targetTypes.length === 0) return {sql: '', params: []};

  Object.keys(filter).forEach(targetType => {
    const spec = filter[targetType];
    const clause = buildTargetTypeClause(targetType, spec, params.length);

    pieces.push(clause.sql);
    params = params.concat(clause.params);

  });

  return {
    sql: pieces.join(' OR '),
    params
  };
}

function buildTargetTypeClause(targetType, spec, offset) {
  if (spec === '*') {
    return {
      sql: `(target_type = $${offset + 1})`,
      params: [targetType]
    }
  }
  if (spec.action) {
    let actions = Array.isArray(spec.action) ? spec.action : [spec.action];
    const actionParams = actions.map((a, i) => `$${offset + i + 2}`).join(', ');
    let sql = `target_type = $${offset + 1} AND action IN (${actionParams})`;
    let params = [targetType].concat(actions);

    if (spec.id) {
      sql += ` AND target_id = $${params.length + 1}`;
      params.push(spec.id);
    }

    return {
      sql: `(${sql})`,
      params
    };
  }
  if (spec.id) {
    return {
      sql: `(target_type = $${offset + 1} AND target_id = $${offset + 2})`,
      params: [targetType, spec.id]
    }
  }
}

function buildEventSelect(where, params, chunkSize) {
  return {
    sql: `SELECT * FROM events${where ? ' ' + where : ''} ORDER BY timestamp, id LIMIT $${params.length + 1}`,
    params: params.concat([chunkSize])
  };
}
