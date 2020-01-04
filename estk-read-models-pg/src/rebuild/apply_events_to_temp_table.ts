import { DatabaseClient } from 'estk-pg';
import { EventStream } from 'estk-events';
import { EventApplier, ReadModelConfig } from '../types';
import getEventApplier from '../event_applier';

const applyEventsToTempTable = async (
  config: ReadModelConfig,
  client: DatabaseClient,
  eventStream: EventStream,
  tableName: string
) => {
  const applier: EventApplier = getEventApplier(config, client);
};

export default applyEventsToTempTable;
