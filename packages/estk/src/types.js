// @flow
//

export type EventStreamBookmark = {
  id: any,
  timestamp: string, // microsecond precise id: any // impl-dependent type
}

export type EventStream = {
  next: () => Promise<?Event>, // null means done
  seek: (bookmark: EventStreamBookmark) => void
};

export type EventStorage = {
  publish: (request: EventPublishRequest) => Promise<Event>,
  getEventStream: (lookup: EventLookup) => Promise<EventStream>,
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


export type EventStore = {
  publish: (event: EventPublishRequest) => Promise<Event>,
  onPublished: (handler: (event: Event) => void) => void,
  getEventStream: (lookup: EventLookup) => Promise<EventStream>,
  close: () => Promise<void>
}
