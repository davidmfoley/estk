import { describe, it } from 'mocha';
import { expect } from 'chai';
import buildWhere from "../src/queries/build_where";
describe('buildWhere', () => {
  it('handles empty query', () => {
    const result = buildWhere({}, {});
    expect(result.sql).to.eql('');
    expect(result.params).to.eql([]);
  });
  it('handles a basic lookup', () => {
    const result = buildWhere({
      name: 'sandwich',
      version: 3
    }, {
      id: '12345'
    });
    expect(result.sql).to.eql('where "sandwich_3"."id"=$1');
    expect(result.params).to.eql(['12345']);
  });
  it('handles lookup with two fields', () => {
    const result = buildWhere({
      name: 'sandwich',
      version: 3
    }, {
      meat: 'beast',
      bread: 'rye'
    });
    expect(result.sql).to.eql('where "sandwich_3"."meat"=$1 and "sandwich_3"."bread"=$2');
    expect(result.params).to.eql(['beast', 'rye']);
  });
});
