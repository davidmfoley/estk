// @flow
import type { ReadModelConfig, ReadModelQuery } from './types';
import type { DatabaseContext} from 'estk-pg/types';

import recordPosition from './record_position';
import EventApplier from './event_applier';

export default (config: ReadModelConfig) => (client: any) => {
  const get = (query: ReadModelQuery) => (
    config.defaultValue
  );

  const getAll = () => [];
  const count = () => 0;

  const applyEvents = async (context: DatabaseContext , events: Event[]) => {
    let lastEvent: ?Event;
    const applier = EventApplier(config, context);

    for (let event of events) {
      lastEvent = lastEvent || await applier(event);
    }

    if (lastEvent) {
      await recordPosition(lastEvent);
    }
  };

  return {
    applyEvents,
    get,
    getAll,
    count,
  }
};
