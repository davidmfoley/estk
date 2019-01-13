// @flow
import { ReadModelConfig, ReadModelLookup } from './types';
import { Event } from 'estk-events';
import { DatabaseContext } from './types';
import recordPosition from './record_position';
import EventApplier from './event_applier';

export default ((config: ReadModelConfig) => (client: any) => {
  const get = (query: ReadModelLookup): Promise<any> => Promise.resolve(config.defaultValue);

  const getAll = (): Promise<any> => Promise.resolve([]);

  const count = (): Promise<number> => Promise.resolve(0);

  const applyEvents = async (context: DatabaseContext, events: Event[]): Promise<void> => {
    let lastEvent: Event | undefined | null;
    const applier = EventApplier(config, context);

    for (let event of events) {
      lastEvent = lastEvent || (await applier(event));
    }

    if (lastEvent) {
      await recordPosition(lastEvent);
    }
  };

  return {
    applyEvents,
    get,
    getAll,
    count
  };
});
