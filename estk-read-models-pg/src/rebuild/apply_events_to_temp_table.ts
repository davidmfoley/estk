import { DatabaseClient } from 'estk-pg';
import { EventStream, EventStreamItem } from 'estk-events';
import { EventApplier, ReadModelConfig } from '../types';
import getEventApplier from '../event_applier';

const applyEventsToTempTable = async (
  config: ReadModelConfig,
  client: DatabaseClient,
  eventStream: EventStream,
  tableName: string
) => {
  const applier: EventApplier = getEventApplier(
    { ...config, tableName },
    client
  );
  let nextItem = await eventStream.next();

  while (!(nextItem as any).ended) {
    await applier(nextItem as any);
    nextItem = await eventStream.next();
  }
};

export default applyEventsToTempTable;
