import { EventStream, StorageEventStream } from "./types";

export default (storageEventStream: StorageEventStream): EventStream => {
    async function reduce(reducer: Function, initialState?: any): any {
      let state = initialState;
      let event;
      do {
        event = await storageEventStream.next();
        if (event.targetType !== '$global') {
          if (!event.ended) {
            state = reducer(state, event)
          }
        }
      } while (!event.ended);

      return state;
    }

    return {
      next: storageEventStream.next,
      seek: storageEventStream.seek,
      reduce
    };
  }
