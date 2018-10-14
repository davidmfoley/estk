// @Flow
import type { ReadModels, ReadModelsConfig } from './types';

async function PostgresReadModels(config: ReadModelsConfig): Promise<ReadModels> {
  const { client } = config;
  let models;
  await setupModels();

  return {
    applyEvents,
    get,
    update,
    query
  }

  function get(name: string): ReadModel {
  }

  function applyEvents(events: Event[], context: Context) {
  }

  function update(name: string): Promise<void> {
  }

  function query(sql: string, params?: any[] = []): Promise<Object[]> {
    return client.query(sql, params);
  }

  async function setupModels() {
    await Promise.all(config.models.map(setupModel));
  }

  async function setupModel(modelConfig) {
    const tables = await ensureSchema(modelConfig);
    return;
  }


  async function ensureSchema({
    name: string,
    version: number = 0
  }) {
  }
}

export default PostgresReadModels;
