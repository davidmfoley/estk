import { describe, it } from 'mocha';
import { expect } from 'chai';
import buildWhere from '../src/queries/build_where';
import Sandwich from './models/sandwich';

describe('buildWhere', () => {
  it('handles empty query', () => {
    const result = buildWhere(Sandwich, {});
    expect(result.sql).to.eql('');
    expect(result.params).to.eql([]);
  });

  it('handles a basic lookup', () => {
    const result = buildWhere(Sandwich, {
      id: '12345',
    });
    expect(result.sql).to.eql('where "sandwich_0"."id"=$1');
    expect(result.params).to.eql(['12345']);
  });

  it('handles lookup with two fields', () => {
    const result = buildWhere(Sandwich, {
      meat: 'beast',
      bread: 'rye',
    });
    expect(result.sql).to.eql(
      'where "sandwich_0"."meat"=$1 and "sandwich_0"."bread"=$2'
    );
    expect(result.params).to.eql(['beast', 'rye']);
  });
});
