import type { DatabaseClient } from './types'
import type { Event, EventLookup, EventStreamBookmark, StorageEventStream, EventStreamItem } from '../../types'
import { BeforeAllEvent } from 'estk-events';
import rowToEvent from './row_to_event';
import buildEventQuery from './build_event_query';

export default function PostgresEventStream(
  client: DatabaseClient,
  lookup: EventLookup = {}
): StorageEventStream {
  const debug = require('debug')('PostgresEventStream');
  debug('created event stream', lookup);

  let count = 0;
  let bookmark: ?EventStreamBookmark = lookup.bookmark;
  let drained: boolean = false;
  let localBuffer = [];

  if (!bookmark) {
    localBuffer.push(BeforeAllEvent);
  }

  return {
    next,
    nextChunk,
    seek
  };

  function seek(toTimestamp: string, toId: any) {
    debug('seeking to ', toTimestamp, toId);
    bookmark = {
      timestamp: toTimestamp,
      id:toId,
    };

    // discard local events before new timestamp
    while (localBuffer.length && ( toTimestamp > localBuffer[0].timestamp || toTimestamp === localBuffer[0].timestamp && toId && toId > localBuffer[0].id)) {
      localBuffer.shift();
    }
  }

  function next(): Promise<EventStreamItem> {
    if (drained) return Promise.resolve(null);

    if (localBufferEmpty()) {
      return refillLocalBuffer().then(() => {
        return popEvent() || { ended: true, bookmark };
      });
    }
    else {
      return Promise.resolve(popEvent());
    }
  }

  function nextChunk(): Promise<Event[]> {
    if (drained) return Promise.resolve([]);
    if (localBufferEmpty()) {
      return refillLocalBuffer().then(() => {
        return flushLocalBuffer();
      });
    }

    return Promise.resolve(flushLocalBuffer());
  }

  function flushLocalBuffer(): Event[] {
    let rows = localBuffer;
    localBuffer = [];

    var last = rows[rows.length - 1];
    bookmark = {
      timestamp: last.timestamp,
      id: last.id
    }
    return rows;
  }

  function popEvent(): ?Event {
    count++;
    let nextEvent = localBuffer.shift();
    if (nextEvent) {
      bookmark = {
        timestamp: nextEvent.timestamp,
        id: nextEvent.id
      }
    }
    return nextEvent;
  }

  function localBufferEmpty(): boolean {
    return localBuffer.length === 0;
  }

  function refillLocalBuffer(): Promise<void> {
    const config = {
      eventCountMin: 2000,
      eventCountMax: 3000
    };
    const CHUNK_SIZE = Math.floor((Math.random() * (config.eventCountMax - config.eventCountMin)) + config.eventCountMin);

    debug('refilling local event stream buffer', count, 'processed so far... from event', bookmark);
    let query = buildEventQuery(lookup.filter, bookmark, CHUNK_SIZE);

    return client.query(query).then(rows => {
      localBuffer = rows.map(rowToEvent);
      if (localBuffer.length === 0) {
        debug('event stream has been drained - total count was ', count, 'events');
        drained = true;
      }
      else {
        debug('refilled local event stream buffer with', rows.length, 'events');
      }
    });
  }
}

