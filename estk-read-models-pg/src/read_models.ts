import { ReadModel, ReadModels, ReadModelsConfig, ReadModelConfig } from './types';
import readModel from './read_model';
import { buildCreateTables } from './queries';
import { ResultSet, DatabaseQuery } from 'estk-pg';
import { Event } from 'estk-events';

type Context = any;

async function PostgresReadModels(config: ReadModelsConfig): Promise<ReadModels> {
  const {
    client
  } = config;
  let models: {
    [name: string]: any;
  } = {};

  await setupModels();

  return {
    applyEvents,
    get: getModel,
    update,
    query
  };

  function getModel(name: string): ReadModel {
    return models[name](client);
  }

  async function applyEvents(events: Event[], context: Context): Promise<void> {
    const asArray: any[] = Object.keys(models).map(k => models[k]);

    for (let model of asArray) {
      await model(context.transaction || client).applyEvents(events);
    }
  }

  function update(name: string): Promise<void> {
    return Promise.resolve();
  }

  function query(q: DatabaseQuery): Promise<ResultSet> {
    return client.query(q);
  }

  async function setupModels() {
    await Promise.all(Object.keys(config.models).map(key => setupModel(key, config.models[key])));
  }

  async function setupModel(key: string, modelConfig: ReadModelConfig) {
    await ensureSchema(modelConfig);
    models[key] = readModel(modelConfig);
    return;
  }

  async function ensureSchema(modelConfig: ReadModelConfig) {
    const {
      sql
    } = buildCreateTables(modelConfig);
    await client.query({
      sql
    });
  }
}

export default PostgresReadModels;
