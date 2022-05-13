import { Event, EventFilter, EventStore } from 'estk-events'

type EventHandler = (state: any, event: Event) => any

type EventHandlerMap = {
  [action: string]: EventHandler
}

type OnDemandReadModelConfig<Shape> = {
  eventFilter: (id: any) => EventFilter
  initialState?: Shape
  reducer:
    | EventHandler
    | {
        [targetType: string]: EventHandler | EventHandlerMap
      }
}

import { OnDemandModel, OnDemandModelUpdate, OnDemandModelState } from './types'

const onDemandModel = <Shape>({
  eventFilter,
  initialState,
  reducer,
}: OnDemandReadModelConfig<Shape>) => (
  store: EventStore
): OnDemandModel<Shape> => {
  async function get(id: any): Promise<OnDemandModelState<Shape>> {
    const filter = eventFilter(id)
    const stream = await store.getEventStream({
      filter,
    })

    return await stream.reduce(streamReducer, initialState)
  }

  const update = async <Shape>({
    id,
    state,
    bookmark,
  }: OnDemandModelUpdate<Shape>): Promise<OnDemandModelState<Shape>> => {
    const filter = eventFilter(id)
    const stream = await store.getEventStream({
      filter,
      bookmark,
    })

    return await stream.reduce(streamReducer, state)
  }

  function streamReducer(state: any = null, nextEvent: Event): any {
    const handler = getHandler(nextEvent, reducer)
    return handler ? handler(state, nextEvent) : state
  }

  return {
    get,
    update,
  }
}

function getHandler(
  { targetType, action }: Event,
  handlers: any
): EventHandler | undefined | null {
  if (typeof handlers === 'function') return handlers
  const handler = handlers[targetType]
  if (!handler) return
  if (typeof handler == 'function') return handler
  return handler[action] || handler['*']
}

export default onDemandModel
