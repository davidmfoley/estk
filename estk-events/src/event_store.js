// @flow
import type {
  Event,
  EventStore,
  EventStoreSettings,
  EventsPublishedHandler,
  EventPublishRequest
} from './types'

export default function init(settings: EventStoreSettings): Promise<EventStore> {
  let publishHandlers = [];
  const { storage } = settings;

  return Promise.resolve({
    publish,
    onPublished,
    getEventStream: storage.getEventStream,
    close
  });

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
    return settings.storage.close();
  }
}
