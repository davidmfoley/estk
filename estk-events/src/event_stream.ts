import { EventStream, StorageEventStream, Event } from './types';

export default (storageEventStream: StorageEventStream): EventStream => {
  async function reduce(reducer: Function, initialState?: any): Promise<any> {
    let state = initialState;
    let event: any;

    do {
      event = await storageEventStream.next();

      if (event.targetType !== '$global') {
        if (!event.ended) {
          state = reducer(state, event);
        }
      }
    } while (!event.ended);

    return { bookmark: storageEventStream.getBookmark(), state };
  }

  async function forEach(
    onEvent: (event: Event) => undefined | Promise<void>
  ): Promise<void> {
    let event: any;

    do {
      event = await storageEventStream.next();

      if (event.ended) {
        const result: any = onEvent(event);
        if (result && result.then) await result();
      }
    } while (!event.ended);
  }

  return {
    getBookmark: storageEventStream.getBookmark,
    next: storageEventStream.next,
    seek: storageEventStream.seek,
    forEach,
    reduce,
  };
};
