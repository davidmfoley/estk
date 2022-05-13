import { OnDemandModel, SnapshotStorage } from './types'

type SnapshotModelConfig<Shape> = {
  storage: SnapshotStorage<Shape>
  model: OnDemandModel<Shape>
}

import { SnapshotModel } from './types'

export default <Shape>({
  storage,
  model,
}: SnapshotModelConfig<Shape>): SnapshotModel<Shape> => ({
  get: async (id: any): Promise<Shape | null> => {
    const existing = await storage.get(id)

    if (existing.notFound) {
      const { state, bookmark } = await model.get(id)
      await storage.put(id, {
        state,
        bookmark,
      })
      return state
    }

    const updated = await model.update({
      id,
      state: existing.state,
      bookmark: existing.bookmark,
    })
    await storage.put(id, updated)
    return updated.state
  },
})
