//@flow
import type {
  Event,
  EventFilter,
  EventStore,
  EventStream,
  EventStreamBookmark,
} from 'estk-events';

type EventHandler = (state: any, event: Event) => any;
type EventHandlerMap = {
  [action: string]: EventHandler,
}

type OnDemandReadModelConfig = {
  eventFilter: (id: any) => EventFilter,
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
    let state = null;
    return await applyStreamToState(stream, state);
  }

  async function update({id, state, bookmark}: UpdateModelRequest): Promise<any> {
    const filter = config.eventFilter(id);
    const stream = await store.getEventStream({filter, bookmark});
    return await applyStreamToState(stream, state);
  }

  async function applyStreamToState(stream: EventStream, state: any) {
    let nextEvent = await stream.next();

    while (nextEvent) {
      const reducer = getHandler(nextEvent, config.reducer);
      if (reducer) state = reducer(state, nextEvent);
      nextEvent = await stream.next();
    }

    return state;

  }
}

function getHandler({targetType, action}: Event, handlers: any): ?EventHandler {
  const handler = handlers[targetType];
  if (!handler) return;
  if (typeof handler == 'function') return handler;
  return handler[action] || handler['*'];
}
