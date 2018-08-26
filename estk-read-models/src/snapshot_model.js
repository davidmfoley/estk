// @flow
import type { EventStreamBookmark } from 'estk-events';
import type { OnDemandModel } from './types';

type Snapshot = {
  state: any,
  bookmark: EventStreamBookmark
};

type NoSnapshot = {
  state: any,
  bookmark: any,
  notFound: true
};

type SnapshotState = Snapshot | NoSnapshot;

type SnapshotStorage = {
  get: (id: any) => Promise<SnapshotState>,
  put: (id: any, snapshot: Snapshot) => Promise<void>,
};

type SnapshotModelConfig = {
  storage: SnapshotStorage,
  model: OnDemandModel
};

import type { SnapshotModel } from './types';

export default ({ storage, model }: SnapshotModelConfig): SnapshotModel => {
  return { get };

  async function get(id: any) {
    const existing = await storage.get(id);

    if (existing.notFound) {
      const { state, bookmark } = await model.get(id);
      await storage.put(id, { state, bookmark });
      return state;
    }

    const updated = await model.update({
      id,
      state: existing.state,
      bookmark: existing.bookmark
    });

    await storage.put(id, updated);
    return updated.state;
  }
};
