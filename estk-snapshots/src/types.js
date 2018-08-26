import type { EventStreamBookmark } from 'estk-events';

type OnDemandModelState = {
  state: any,
  bookmark: EventStreamBookmark
};

export type OnDemandModel = {
  get: (id: string) => Promise<OnDemandModelState>,
  update: (req: OnDemandModelUpdate) => Promise<OnDemandModelState>,
}

export type SnapshotModel = {
  get: (id: any) => Promise<any>
};

export type Snapshot = {
  state: any,
  bookmark: EventStreamBookmark
};

type NoSnapshot = {
  state: any,
  bookmark: any,
  notFound: true
};

type SnapshotState = Snapshot | NoSnapshot;

export type SnapshotStorage = {
  get: (id: any) => Promise<SnapshotState>,
  put: (id: any, snapshot: Snapshot) => Promise<void>,
};
