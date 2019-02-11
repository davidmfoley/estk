import { DatabaseClient } from "estk-pg/lib";
import { ReadModelConfig } from "../types";

const copyToTable = async (
  client: DatabaseClient,
  config: ReadModelConfig,
  sourceTableName: string
) => {};
export default copyToTable;
