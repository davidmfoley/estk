import { EventStreamBookmark } from 'estk-events';

export type OnDemandModelState<Shape> = {
  state: Shape;
  bookmark: EventStreamBookmark;
};

export type OnDemandModelUpdate<Shape> = {
  id: string;
  state: Shape;
  bookmark: EventStreamBookmark;
};

export type OnDemandModel<Shape> = {
  get: (id: string) => Promise<OnDemandModelState<Shape>>;
  update: (
    req: OnDemandModelUpdate<Shape>
  ) => Promise<OnDemandModelState<Shape>>;
};

export type SnapshotModel<Shape> = {
  get: (id: any) => Promise<Shape | null>;
};

export type Snapshot<Shape> = {
  state: Shape;
  bookmark: EventStreamBookmark;
  notFound?: false;
};

type NoSnapshot = {
  state: null;
  bookmark: null;
  notFound: true;
};

export type SnapshotState<Shape> = Snapshot<Shape> | NoSnapshot;

export type SnapshotStorage<Shape> = {
  get: (id: any) => Promise<SnapshotState<Shape>>;
  put: (id: any, snapshot: Snapshot<Shape>) => Promise<void>;
};
