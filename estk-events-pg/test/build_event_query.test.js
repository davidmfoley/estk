import { describe, it } from 'mocha';
import buildEventQuery from '../src/build_event_query';
import { expect } from 'chai';

describe('buildEventQuery', () => {
  it('handles no lookup and no bookmark', () => {
    let query = buildEventQuery(null, null, 10)
    expect(query.sql).to.eq('SELECT * FROM events ORDER BY timestamp, id LIMIT $1');
    expect(query.params).to.eql([10]);
  });

  it('handles lookup with a type', () => {
    let query = buildEventQuery({
      robot: '*'
    }, null, 10)

    expect(query.sql).to.eq('SELECT * FROM events WHERE (target_type = $1) ORDER BY timestamp, id LIMIT $2');
    expect(query.params).to.eql(['robot', 10]);
  });

  it('handles lookup of specific id', () => {
    let query = buildEventQuery({
      robot: {id: '42'}
    }, null, 10)

    expect(query.sql).to.eq('SELECT * FROM events WHERE (target_type = $1 AND target_id = $2) ORDER BY timestamp, id LIMIT $3');
    expect(query.params).to.eql(['robot', '42', 10]);
  });

  it('handles lookup of actions', () => {
    let query = buildEventQuery({
      robot: {action: ['create', 'update']}
    }, null, 10)

    expect(query.sql).to.eq('SELECT * FROM events WHERE (target_type = $1 AND action IN ($2, $3)) ORDER BY timestamp, id LIMIT $4');
    expect(query.params).to.eql(['robot', 'create', 'update', 10]);
  });

  it('handles lookup of target, type and id', () => {
    let query = buildEventQuery({
      robot: {action: ['create', 'update'], id: '42'}
    }, null, 10)

    expect(query.sql).to.eq('SELECT * FROM events WHERE (target_type = $1 AND action IN ($2, $3) AND target_id = $4) ORDER BY timestamp, id LIMIT $5');
    expect(query.params).to.eql(['robot', 'create', 'update', '42', 10]);
  });

  it('handles lookup of multiple target types', () => {
    let query = buildEventQuery({
      robot: {action: ['create', 'update']},
      cyborg: '*'
    }, null, 10)

    expect(query.sql).to.eq('SELECT * FROM events WHERE (target_type = $1 AND action IN ($2, $3)) OR (target_type = $4) ORDER BY timestamp, id LIMIT $5');
    expect(query.params).to.eql(['robot', 'create', 'update', 'cyborg', 10]);
  });
});
