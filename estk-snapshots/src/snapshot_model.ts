import { OnDemandModel, SnapshotStorage } from './types';

type SnapshotModelConfig = {
  storage: SnapshotStorage;
  model: OnDemandModel;
};

import { SnapshotModel } from './types';

export default ({ storage, model }: SnapshotModelConfig): SnapshotModel => {
  return {
    get,
  };

  async function get(id: any): Promise<any> {
    const existing = await storage.get(id);

    if (existing.notFound) {
      const { state, bookmark } = await model.get(id);
      await storage.put(id, {
        state,
        bookmark,
      });
      return state;
    }

    const updated = await model.update({
      id,
      state: existing.state,
      bookmark: existing.bookmark,
    });
    await storage.put(id, updated);
    return updated.state;
  }
};
