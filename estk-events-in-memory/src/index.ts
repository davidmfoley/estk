import { Timestamps } from 'estk-events';

import {
  Event,
  EventLookup,
  EventStorage,
  StorageEventStream,
  EventStreamItem,
  EventStreamBookmark,
  EventPublishRequest
} from 'estk-events';

import { BeforeAllEvent } from 'estk-events';

let nextId = 0;

function InMemoryStorage(): EventStorage {
  let events = [BeforeAllEvent];

  function publish(
    request: EventPublishRequest[],
     onPublished: Function
  ): Promise<Event[]> {
    const published = request.map(toPublish => {
      const {
        data,
        meta,
        targetId,
        targetType,
        action
      } = toPublish;
      nextId++;
      const event: Event = {
        id: nextId,
        timestamp: Timestamps.now(),
        action,
        data,
        meta: meta || {},
        targetId,
        targetType
      };
      events.push(event);
      return event;
    });

    try {
      onPublished(published);
    } catch (e) {
      const badIds = new Set(...published.map(e => e.id));
      events = events.filter(e => !badIds.has(e.id));
      return Promise.reject(e);
    }

    return Promise.resolve(published);
  }

  function getEventStream(lookup: EventLookup): Promise<StorageEventStream> {
    const lookupFilter = filterEvents.bind(null, lookup || {});
    let index = 0;
    let soughtBookmark: EventStreamBookmark;

    function next(): Promise<EventStreamItem> {
      while (index < events.length && !lookupFilter(events[index])) {
        index++;
      }

      const resolved = Promise.resolve(events[index] || {
        ended: true,
        bookmark: getBookmark()
      });
      index++;
      return resolved;
    }

    function seek(bookmark: EventStreamBookmark) {
      soughtBookmark = bookmark;

      while (isBeforeBookmark(bookmark, events[0])) {
        index++;
      }
    }

    function getBookmark() {
      if (events.length > 0) {
        const last = events[events.length - 1];
        return {
          id: last.id,
          timestamp: last.timestamp
        };
      }

      return soughtBookmark || lookup.bookmark || {
        id: '',
        timestamp: ''
      };
    }

    return Promise.resolve({
      next,
      seek
    });
  }

  function isBeforeBookmark(bookmark: EventStreamBookmark, event: Event) {
    return bookmark.timestamp > event.timestamp || bookmark.id && bookmark.timestamp === event.timestamp && bookmark.id <= event.id;
  }

  function filterEvents(lookup: EventLookup, event: Event) {
    const {
      filter,
      bookmark
    } = lookup;
    if (!filter) return true;
    const timestamp = bookmark ? bookmark.timestamp : null;
    if (bookmark && isBeforeBookmark(bookmark, event)) return true;

    if (event.action === BeforeAllEvent.action) {
      return !timestamp;
    }

    const spec: any = filter[event.targetType];
    if (!spec) return false;
    let action: any = spec.action || '';

    if (spec.id) {
      if (!isMatch(spec.id, event.targetId)) return false;
    }

    if (action) {
      if (!isMatch(action, event.action)) return false;
    }

    return true;
  }

  function isMatch(arrayOrSingle: any, value: string) {
    if (Array.isArray(arrayOrSingle)) return arrayOrSingle.indexOf(value) > -1;
    return arrayOrSingle === value;
  }

  function close(): Promise<void> {
    return Promise.resolve();
  }

  return {
    publish,
    getEventStream,
    close
  };
};

export default InMemoryStorage;
