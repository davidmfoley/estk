import { DatabaseClient } from 'estk-pg';
import { SnapshotStorage, SnapshotState } from 'estk-snapshots';

export type PostgresqlSnapshotConfig = {
  client: DatabaseClient;
  tableName: string;
};

export default <State>({
  client,
  tableName,
}: PostgresqlSnapshotConfig): SnapshotStorage<State> => {
  return {
    get,
    put,
  };

  async function get(id: any): Promise<SnapshotState<State>> {
    await ensureTableExists();
    const result = await client.query({
      sql: `
        select id, state, bookmark
        from "${tableName}"
        where id=$1`,
      params: [id],
    });

    if (result.length) {
      return result[0];
    }

    return {
      notFound: true,
      state: null,
      bookmark: null,
    };
  }

  async function put(
    id: any,
    { state, bookmark }: SnapshotState<State>
  ): Promise<void> {
    await ensureTableExists();
    await client.query({
      sql: `
        insert into "${tableName}" (id, state, bookmark)
        values ($1, $2, $3)
        on conflict (id) do update set state=EXCLUDED.state, bookmark=EXCLUDED.bookmark `,
      params: [id, state, bookmark],
    });
  }

  async function ensureTableExists() {
    await client.query({
      sql: `create table if not exists "${tableName}" (
        id varchar PRIMARY KEY,
        state jsonb,
        bookmark jsonb
      )`,
    });
  }
};
