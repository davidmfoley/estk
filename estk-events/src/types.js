// @flow
//

export type EventStreamBookmark = {
  id: any, // impl-dependent
  timestamp: string, // microsecond precise
}

export type EventStorage = {
  publish: (request: EventPublishRequest) => Promise<Event>,
  getEventStream: (lookup: EventLookup) => Promise<StorageEventStream>,
  close: () => Promise<void>,
}

export type EventPublishRequest = {
  targetType: string,
  targetId: string,
  action: string,
  data: Object,
  meta?: Object,
  timestamp?: string,
}

export type Event = {
  id: any,
  targetType: string,
  targetId: string,
  action: string,
  data: Object,
  meta: Object,
  timestamp: string
}

export type EventStreamEnd = {
  ended: true,
  bookmark: EventStreamBookmark,
}

export type EventStreamItem = Event | EventStreamEnd;

export type StorageEventStream = {
  next: () => Promise<EventStreamItem>,
  seek: (bookmark: EventStreamBookmark) => void
};

export type EventStream = StorageEventStream & {
  reduce: (reducer: Function, initialState?: any) => Promise<any>
};

export type EventStoreSettings = {
  storage: EventStorage,
}

type EventFilterSpec = string
  | { id: any }
  | { action: any }

export type EventFilter = {
  [targetType: string]: EventFilterSpec
}


export type EventLookup = {
  bookmark?: { id: any, timestamp: string },
  filter?: EventFilter
}

export type EventsPublishedHandler = (event: Event[]) => Promise<void> | void

export type EventStore = {
  publish: (event: EventPublishRequest) => Promise<Event>,
  onPublished: (handler: EventsPublishedHandler) => void,
  getEventStream: (lookup: EventLookup) => Promise<EventStream>,
  close: () => Promise<void>
}

