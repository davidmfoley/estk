//@flow
import type {
  Event,
  EventFilter,
  EventStore,
  EventStreamBookmark,
} from 'estk-events';

type EventHandler = (state: any, event: Event) => any;
type EventHandlerMap = {
  [action: string]: EventHandler,
}

type OnDemandReadModelConfig = {
  eventFilter: (id: any) => EventFilter,
  initialState?: any,
  reducer: EventHandler | {
    [targetType: string]: EventHandler | EventHandlerMap
  }
}

type UpdateModelRequest = {
  id: any,
  state: any,
  bookmark: EventStreamBookmark
}

import type OnDemandModel from './types';

export default (config: OnDemandReadModelConfig) => (store: EventStore): OnDemandModel => {
  return { get, update };

  async function get(id: any) {
    const filter = config.eventFilter(id);

    const stream = await store.getEventStream({filter});
    return await stream.reduce(reducer, config.initialState || null);
  }

  async function update({id, state, bookmark}: UpdateModelRequest): Promise<any> {
    const filter = config.eventFilter(id);
    const stream = await store.getEventStream({filter, bookmark});
    return await stream.reduce(reducer, state);
  }

  function reducer(state = null, nextEvent) {
    const handler = getHandler(nextEvent, config.reducer);
    return handler ? handler(state, nextEvent) : state;
  }
}

function getHandler({targetType, action}: Event, handlers: any): ?EventHandler {
  const handler = handlers[targetType];
  if (!handler) return;
  if (typeof handler == 'function') return handler;
  return handler[action] || handler['*'];
}
