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

  function publish(
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

    return storage.publish(event);
  }

  function onPublished(handler: EventsPublishedHandler) {
    publishHandlers.push(handler);
  }

  function close() : Promise<void> {
    return settings.storage.close();
  }
}
