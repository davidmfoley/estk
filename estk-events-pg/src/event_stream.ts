import { DatabaseClient } from 'estk-pg'

import {
  Event,
  EventLookup,
  EventStreamBookmark,
  StorageEventStream,
  BeforeAllEvent,
  EventStreamItem,
} from 'estk-events'

import rowToEvent from './row_to_event'
import { eventQueryBuilder } from './build_event_query'

const beginningBookmark: EventStreamBookmark = {
  timestamp: '0001-01-01',
  id: '0',
}

export default function PostgresEventStream(
  client: DatabaseClient,
  tableName: string,
  lookup: EventLookup = {}
): StorageEventStream {
  const debug = require('debug')('PostgresEventStream')

  debug('created event stream', lookup)
  let count = 0
  let bookmark: EventStreamBookmark = lookup.bookmark || beginningBookmark
  let drained: boolean = false
  let localBuffer: Event[] = []

  if (bookmark === beginningBookmark) {
    localBuffer.push(BeforeAllEvent)
  }

  return {
    next,
    getBookmark: () => bookmark,
    seek,
  }

  function seek(bookmark: EventStreamBookmark) {
    debug('seeking to ', bookmark)

    while (
      localBuffer.length &&
      (bookmark.timestamp > localBuffer[0].timestamp ||
        (bookmark.timestamp === localBuffer[0].timestamp &&
          bookmark.id &&
          bookmark.id > localBuffer[0].id))
    ) {
      localBuffer.shift()
    }
  }

  function endedEvent(): EventStreamItem {
    return {
      ended: true,
      bookmark,
    } as EventStreamItem
  }

  function next(): Promise<EventStreamItem> {
    if (drained) return Promise.resolve(endedEvent())

    if (localBufferEmpty()) {
      return refillLocalBuffer().then(() => popEvent() || endedEvent())
    } else {
      return Promise.resolve(popEvent() as Event)
    }
  }

  /*
  function nextChunk(): Promise<Event[]> {
    if (drained) return Promise.resolve([]);

    if (localBufferEmpty()) {
      return refillLocalBuffer().then(() => {
        return flushLocalBuffer();
      });
    }

    return Promise.resolve(flushLocalBuffer());
  }
  */

  function flushLocalBuffer(): Event[] {
    let rows = localBuffer
    localBuffer = []
    var last = rows[rows.length - 1]
    bookmark = {
      timestamp: last.timestamp,
      id: last.id,
    }
    return rows
  }

  function popEvent(): Event | undefined | null {
    count++
    let nextEvent = localBuffer.shift()

    if (nextEvent) {
      bookmark = {
        timestamp: nextEvent.timestamp,
        id: nextEvent.id,
      }
    }

    return nextEvent
  }

  function localBufferEmpty(): boolean {
    return localBuffer.length === 0
  }

  function refillLocalBuffer(): Promise<void> {
    const config = {
      eventCountMin: 2000,
      eventCountMax: 3000,
    }
    const CHUNK_SIZE = Math.floor(
      Math.random() * (config.eventCountMax - config.eventCountMin) +
        config.eventCountMin
    )
    debug(
      'refilling local event stream buffer',
      count,
      'processed so far... from event',
      bookmark
    )

    const buildEventQuery = eventQueryBuilder(tableName, CHUNK_SIZE)
    let query = buildEventQuery(lookup.filter, bookmark)

    return client.query(query).then(rows => {
      localBuffer = rows.map(rowToEvent)

      if (localBuffer.length === 0) {
        debug(
          'event stream has been drained - total count was ',
          count,
          'events'
        )
        drained = true
      } else {
        debug('refilled local event stream buffer with', rows.length, 'events')
      }
    })
  }
}
