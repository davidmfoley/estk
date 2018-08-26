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
