import { describe, it } from 'mocha'
import { expect } from 'chai'
import { buildCreateTables } from '../src/queries'
describe('queries', () => {
  describe('buildCreateTables', () => {
    it('handles a model with just a single field', () => {
      const result = buildCreateTables({
        name: 'foo',
        version: 0,
        fields: {
          id: {
            type: 'varchar',
          },
        },
        events: {},
      })

      expect(result.sql).to.match(
        /create table if not exists "foo_0" \("id" varchar\)/i
      )
    })
  })
})
