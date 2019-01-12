// @flow
//
export type EventStreamBookmark = {
  id: any;
  timestamp: string;
};
type PublishedHandler = (events: Event[], context: Object) => Promise<void>;
export type EventStorage = {
  publish: (request: EventPublishRequest[], onPublished: PublishedHandler) => Promise<Event[]>;
  getEventStream: (lookup: EventLookup) => Promise<StorageEventStream>;
  close: () => Promise<void>;
};
export type EventPublishRequest = {
  targetType: string;
  targetId: string;
  action: string;
  data: Object;
  meta?: Object;
  timestamp?: string;
};

export type EventsPublishRequest = EventPublishRequest | EventPublishRequest[];

export type Event = {
  id: any;
  targetType: string;
  targetId: string;
  action: string;
  data: Object;
  meta: Object;
  timestamp: string;
};

export type EventStreamEnd = {
  ended: true;
  bookmark: EventStreamBookmark;
};

export type EventStreamItem = Event | EventStreamEnd;

export type StorageEventStream = {
  next: () => Promise<EventStreamItem>;
  seek: (bookmark: EventStreamBookmark) => void;
};

export type EventStream = StorageEventStream & {
  reduce: (reducer: (e: Event) => Promise<any>, initialState: any) => Promise<any>;
  forEach: (onEvent: (e: Event) => Promise<void>) => Promise<void>;
};

export type EventStoreSettings = {
  storage: EventStorage;
};

type EventFilterSpec = string | {
  id: any;
} | {
  action: any;
};

export type EventFilter = {
  [targetType: string]: EventFilterSpec;
};

export type EventLookup = {
  bookmark?: {
    id: any;
    timestamp: string;
  };
  filter?: EventFilter;
};

export type EventsPublishedHandler = (event: Event[]) => Promise<void> | void;

export type EventStore = {
  publish: (event: EventPublishRequest) => Promise<Event[]>;
  onPublished: (handler: EventsPublishedHandler) => void;
  getEventStream: (lookup: EventLookup) => Promise<EventStream>;
  close: () => Promise<void>;
};
