//@flow
import type {
  Event,
  EventFilter,
  EventStore
} from 'estk-events';

type EventHandler = (state: any, event: Event) => any;
type EventHandlerMap = {
  [action: string]: EventHandler,
}

type OnDemandReadModelConfig = {
  eventFilter: (id: any) => EventFilter,
  reducer: EventHandler | {
    [targetType: string]: EventHandler | EventHandlerMap
  } }

export default (config: OnDemandReadModelConfig) => (store: EventStore) => {
  return { get };

  async function get(id: any) {
    const filter = config.eventFilter(id);
    const stream = await store.getEventStream(filter);
    let state = null;
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
