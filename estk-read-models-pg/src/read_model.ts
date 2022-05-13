import { ReadModelConfig, ReadModelLookup } from './types'
import { Event, EventStore } from 'estk-events'
import { DatabaseContext } from './types'
import recordPosition from './record_position'
import EventApplier from './event_applier'
import { DatabaseClient } from 'estk-pg'
import rebuild from './rebuild'
import { buildSelect, buildSelectOne, buildSelectCount } from './queries'

export default (config: ReadModelConfig) => (client: DatabaseClient) => {
  const get = async (lookup?: ReadModelLookup): Promise<any> => {
    const query = buildSelectOne(config, lookup || {})
    const results = await client.query(query)
    return results[0]
  }

  const getAll = async (lookup?: ReadModelLookup): Promise<any> => {
    const query = buildSelect(config, lookup || {})
    const results = await client.query(query)
    return results
  }

  const count = async (lookup?: ReadModelLookup): Promise<number> => {
    const query = buildSelectCount(config, lookup || {})
    const results = await client.query(query)
    return results[0].count
  }

  const applyEvents = async (
    events: Event[],
    context: DatabaseContext
  ): Promise<void> => {
    let lastEvent: Event | undefined | null
    const applier = EventApplier(config, client)

    for (let event of events) {
      lastEvent = event
      await applier(event)
    }

    if (lastEvent) {
      await recordPosition(lastEvent)
    }
  }

  return {
    applyEvents,
    get,
    getAll,
    count,
    rebuild: (eventStore: EventStore) =>
      rebuild({ model: config, client, eventStore }),
  }
}
