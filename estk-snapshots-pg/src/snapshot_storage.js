// @flow
import type { DatabaseClient } from 'estk-pg/types';
import type { SnapshotStorage, SnapshotState } from 'estk-snapshots/types';

type PostgresqlSnapshotConfig  = {
  client: DatabaseClient,
  tableName: string,
}

export default ({ client, tableName }: PostgresqlSnapshotConfig ): SnapshotStorage => {
  return {
    get,
    put
  };

  async function get(id: any): Promise<SnapshotState> {
    await ensureTableExists();
    const result = await client.query(`
      select id, state, bookmark
      from "${tableName}"
      where id=$1
    `, [id]);

    if (result.length) {
      return result[0];
    }

    return {
      notFound: true
    }
  }


  async function put(id: any, { state, bookmark}: SnapshotState): Promise<void> {
    await ensureTableExists();

    await client.query(`
      insert into "${tableName}" (id, state, bookmark)
      values ($1, $2, $3)
      on conflict (id) do update set state=EXCLUDED.state, bookmark=EXCLUDED.bookmark
    `, [id, state, bookmark]);
  }

  async function ensureTableExists() {
    await client.query(`create table if not exists "${tableName}" (
      id varchar PRIMARY KEY,
      state jsonb,
      bookmark jsonb
    )`);
  }
} 
