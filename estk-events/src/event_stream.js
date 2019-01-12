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

    async function forEach(onEvent: (event: Object) => Promise<*>): Promise<void> {
      let event;
      do {
        event = await storageEventStream.next();
        if (!event.ended) {
          const result = onEvent(event);
          if (result && result.then) await result();
        }
      } while (!event.ended);
    }

    return {
      next: storageEventStream.next,
      seek: storageEventStream.seek,
      forEach,
      reduce
    };
  }
