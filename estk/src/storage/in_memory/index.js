// @flow
const timestamps = require('../timestamps');

import type {
  Event,
  EventLookup,
  EventStorage,
  EventStream,
  EventStreamBookmark,
  EventPublishRequest
} from '../../types'

import beforeAllEvent from '../before_all_event';

let nextId = 0;

module.exports = function() : EventStorage  {
  let events = [beforeAllEvent];

  function publish({ data, meta, targetId, targetType, action }: EventPublishRequest): Promise<Event> {
    nextId++;

    const event: Event = {
      id: nextId,
      timestamp: timestamps.now(),
      action,
      data,
      meta: meta || {},
      targetId,
      targetType
    };

    events.push(event);

    return Promise.resolve(event);
  }

  function getEventStream(lookup: EventLookup): Promise<EventStream> {
    const lookupFilter = filterEvents.bind(null, lookup || {});
    let index = 0;

    function next(): Promise<Event> {
      while (index < events.length && !lookupFilter(events[index])) {
        index++;
      }
      const resolved = Promise.resolve(events[index] || null);
      index++;
      return resolved;
    }

    function seek(bookmark: EventStreamBookmark) {
      while(isBeforeBookmark(bookmark, events[0])) {
        index++;
      }
    }

    return Promise.resolve({
      next,
      seek
    });
  }

  function isBeforeBookmark(bookmark, event) {
    return bookmark.timestamp > event.timestamp ||
      (bookmark.id && bookmark.timestamp === event.timestamp && bookmark.id <= event.id);
  }

  function filterEvents(lookup: EventLookup, event: Event) {
    const {filter, bookmark} = lookup;

    if (!filter) return true;

    const timestamp = bookmark ? bookmark.timestamp : null;
    if (bookmark && isBeforeBookmark(bookmark, event)) return true;

    if (event.action === beforeAllEvent.action) {
      return !timestamp;
    }

    const spec = filter[event.targetType];
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
    publish, getEventStream, close
  };
}
