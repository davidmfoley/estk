import { DatabaseClient } from "estk-pg/lib";
import { ReadModelConfig } from "../types";

import {
  buildCreateTables,
  buildEmptyTables,
  copyFromTempTable,
} from '../queries';

const copyToTable = async (
  client: DatabaseClient,
  config: ReadModelConfig,
  sourceTableName: string
) => {
  const transaction = await client.transaction();

  await transaction.query(buildCreateTables(config));
  await transaction.query(buildEmptyTables(config));
  await transaction.query(copyFromTempTable(config, sourceTableName));

  await transaction.commit();
};

export default copyToTable;
