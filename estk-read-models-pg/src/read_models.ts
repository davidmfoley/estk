import {
  ReadModel,
  ReadModels,
  ReadModelsConfig,
  ReadModelConfig,
} from './types'
import readModel from './read_model'
import { buildCreateTables } from './queries'
import { ResultSet, DatabaseQuery } from 'estk-pg'
import { Event } from 'estk-events'

type Context = any

async function PostgresReadModels(
  config: ReadModelsConfig
): Promise<ReadModels> {
  const { client } = config
  let models: {
    [name: string]: any
  } = {}

  const allModels = () => Object.keys(models).map(k => models[k])
  await setupModels()

  return {
    applyEvents,
    get: getModel,
    update,
    query,
    rebuildAll,
  }

  function getModel(name: string): ReadModel {
    return models[name](client)
  }

  async function applyEvents(events: Event[], context: Context): Promise<void> {
    const asArray: any[] = Object.keys(models).map(k => models[k])

    for (let model of asArray) {
      await model(context.transaction || client).applyEvents(events, context)
    }
  }

  function update(name: string): Promise<void> {
    return Promise.resolve()
  }

  async function rebuildAll(): Promise<void> {
    for (let model of allModels()) {
      await model(client).rebuild(config.eventStore)
    }
  }

  function query(q: DatabaseQuery): Promise<ResultSet> {
    return client.query(q)
  }

  async function setupModels() {
    const keys = Object.keys(config.models)
    await Promise.all(keys.map(setupModel))
  }

  async function setupModel(key: string) {
    const modelConfig = config.models[key]
    await ensureSchema(modelConfig)
    models[key] = readModel(modelConfig)
    return
  }

  async function ensureSchema(modelConfig: ReadModelConfig) {
    await client.query(buildCreateTables(modelConfig))
  }
}

export default PostgresReadModels
