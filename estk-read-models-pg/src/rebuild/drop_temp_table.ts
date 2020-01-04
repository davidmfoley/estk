import { DatabaseClient } from 'estk-pg';

const dropTempTable = async (client: DatabaseClient, tableName: string) => {
  await client.query({ sql: `drop table "${tableName}";` });
};
export default dropTempTable;
