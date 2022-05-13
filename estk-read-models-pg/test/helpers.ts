import { PostgresClient } from 'estk-pg';
import PostgresEventStorage from 'estk-events-pg';

export async function cleanDatabase() {
  const client = await PostgresClient({
    url: process.env.DATABASE_URL_TEST || '',
  });

  const results = await client.query({
    sql: `
      select table_schema as schema, table_name AS name
      from information_schema.tables
      where table_schema <> 'pg_catalog'
        and table_type='BASE TABLE'
    `,
  });

  const sql = results
    .map(({ schema, name }) => `drop table "${schema}"."${name}" cascade;`)
    .join('\n');
  await client.query({ sql });

  const eventStorage = await PostgresEventStorage(client);
  await eventStorage.createSchema();
  await eventStorage.close();
}
