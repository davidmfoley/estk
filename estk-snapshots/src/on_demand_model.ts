//@flow
import { Event, EventFilter, EventStore, EventStreamBookmark } from 'estk-events';

type EventHandler = (state: any, event: Event) => any;

type EventHandlerMap = {
  [action: string]: EventHandler;
};

type OnDemandReadModelConfig = {
  eventFilter: (id: any) => EventFilter;
  initialState?: any;
  reducer: EventHandler | {
    [targetType: string]: EventHandler | EventHandlerMap;
  };
};


import {
  OnDemandModel,
  OnDemandModelUpdate,
  OnDemandModelState
} from './types';

export default (({
  eventFilter,
  initialState,
  reducer
}: OnDemandReadModelConfig) => (store: EventStore): OnDemandModel => {
  return {
    get,
    update
  };

  async function get(id: any): Promise<OnDemandModelState> {
    const filter = eventFilter(id);
    const stream = await store.getEventStream({
      filter
    });

    return await stream.reduce(streamReducer, initialState);
  }

  async function update({
    id,
    state,
    bookmark
  }: OnDemandModelUpdate): Promise<OnDemandModelState> {
    const filter = eventFilter(id);
    const stream = await store.getEventStream({
      filter,
      bookmark
    });

    return await stream.reduce(streamReducer, state);
  }

  function streamReducer(state: any = null, nextEvent: Event): any {
    const handler = getHandler(nextEvent, reducer);
    return handler ? handler(state, nextEvent) : state;
  }
});

function getHandler({
  targetType,
  action
}: Event, handlers: any): EventHandler | undefined | null {
  if (typeof handlers === 'function') return handlers;
  const handler = handlers[targetType];
  if (!handler) return;
  if (typeof handler == 'function') return handler;
  return handler[action] || handler['*'];
}
