// @flow
import type { EventLookup } from "estk-events/src/types";
import EventStream from './event_stream';

import type {
  Event,
  EventStore,
  EventStoreSettings,
  EventsPublishedHandler,
  EventsPublishRequest
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

  async function publish( event: EventsPublishRequest ): Promise<Event[]> {
    const onEventPublished = async (published, context = {}) => {
      for (let handler of publishHandlers) {
        const result = handler(published, context);
        if (result && result.then) await result;
      }
    }

    if (!Array.isArray(event)) event = [event];

    const published = await storage.publish(event, onEventPublished);

    return published;
  }

  function onPublished(handler: EventsPublishedHandler) {
    publishHandlers.push(handler);
  }

  function close() : Promise<void> {
    return storage.close();
  }
}
