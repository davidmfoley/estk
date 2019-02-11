import { DatabaseClient } from "estk-pg";
import { ReadModelConfig } from "../types";
import { buildCreateTempTable } from "../queries";
import uuidv4 from 'uuid/v4';

const createTempTable = async (
  client: DatabaseClient,
  config: ReadModelConfig
) => {
  const uniqueId = uuidv4().replace(/\-/g, '');
  const tableName = `${config.name}_${config.version}_${uniqueId}`;
  const query = await buildCreateTempTable(config, tableName);
  await client.query(query);
  return tableName;
};
export default createTempTable;
