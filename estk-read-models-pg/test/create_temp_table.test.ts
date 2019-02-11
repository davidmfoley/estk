import { PostgresClient } from 'estk-pg';
import sandwich from './models/sandwich';
import createTempTable from '../src/rebuild/create_temp_table';
import { expect } from 'chai';

describe('createTempTable', () => {
  it('creates a temp table', async () => {
    const client = await PostgresClient({
      url: process.env.DATABASE_URL_TEST || ''
    });

    const tempTable = await createTempTable(
      client,
      sandwich
    );

    const result = await client.query({
       sql: `select from ${tempTable}`
    });

    expect(result.length).to.eq(0);
  });
});
