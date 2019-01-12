// @flow
import type {
   ReadModels,
   ReadModelsConfig,
   ReadModelConfig,
 } from './types';

 import ReadModel from './read_model';

 import { buildCreateTables } from './queries';

async function PostgresReadModels(config: ReadModelsConfig): Promise<ReadModels> {
  const { client } = config;
  let models: {
    [name: string]: any
  } = {};

  await setupModels();

  return {
    applyEvents,
    get: getModel,
    update,
    query
  }

  function getModel(name: string): ReadModel {
    return models[name](client);
  }

  async function applyEvents(events: Event[], context: Context): void {
    for (let model: any of Object.values(models)) {
      await model(context.transaction || client).applyEvents(events);
    }
  }

  function update(name: string): Promise<void> {
  }

  function query(sql: string, params?: any[] = []): Promise<Object[]> {
    return client.query({sql, params});
  }

  async function setupModels() {
    await Promise.all(Object.keys(config.models).map(
      key => setupModel(key, config.models[key]))
    );
  }

  async function setupModel(key: string, modelConfig: ReadModelConfig) {
    await ensureSchema(modelConfig);
    models[key] = ReadModel(modelConfig);

    return;
  }


  async function ensureSchema(modelConfig) {
    const { sql } = buildCreateTables(modelConfig);
    await client.query({sql});
  }
}

export default PostgresReadModels;
