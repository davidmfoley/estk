// @flow
import type { EventLookup } from "estk-events/src/types";
import EventStream from './event_stream';

import type {
  Event,
  EventStore,
  EventStoreSettings,
  EventsPublishedHandler,
  EventPublishRequest
} from './types'

export default function init({storage}: EventStoreSettings): Promise<EventStore> {
  let publishHandlers = [];

  return Promise.resolve({
    publish,
    onPublished,
    getEventStream,
    close
  });

  async function getEventStream(lookup: EventLookup): EventStream {
    const storageEventStream = await storage.getEventStream(lookup);
    return EventStream(storageEventStream);
  }

  async function publish(
    event: EventPublishRequest | string,
    targetId?: string,
    action?: string,
    data?: Object,
    meta?: Object,
  ): Promise<Event> {
    if (typeof event === 'string') {
      event = {
        targetType: event,
        targetId: targetId || '',
        action: action || '',
        data: data || {},
        meta: meta || {},
      };
    }

    const published = await storage.publish(event);
    for (let handler of publishHandlers) {
      handler([published]);
    }

    return published;
  }

  function onPublished(handler: EventsPublishedHandler) {
    publishHandlers.push(handler);
  }

  function close() : Promise<void> {
    return storage.close();
  }
}
