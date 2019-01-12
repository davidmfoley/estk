// @flow
import { EventLookup } from "estk-events/src/types";
import createEventStream from './event_stream';
import { Event, EventStream, EventStore, EventStoreSettings, EventsPublishedHandler, EventsPublishRequest } from './types';
export default function init({
  storage
}: EventStoreSettings): Promise<EventStore> {
  let publishHandlers: Function[] = [];

  const eventStore: EventStore = {
    publish,
    onPublished,
    getEventStream,
    close
  };

  return Promise.resolve(eventStore);

  async function getEventStream(lookup: EventLookup): Promise<EventStream> {
    const storageEventStream = await storage.getEventStream(lookup);

    return createEventStream(storageEventStream);
  }

  async function publish(event: EventsPublishRequest): Promise<Event[]> {

    const onEventPublished = async (published: Event[], context: any = {}) => {
      for (let handler of publishHandlers) {
        const result: any = handler(published, context);
        if (result && result.then) await result;
      }
    };

    if (!Array.isArray(event)) event = [event];
    const published = await storage.publish(event, onEventPublished);
    return published;
  }

  function onPublished(handler: EventsPublishedHandler) {
    publishHandlers.push(handler);
  }

  function close(): Promise<void> {
    return storage.close();
  }
}
