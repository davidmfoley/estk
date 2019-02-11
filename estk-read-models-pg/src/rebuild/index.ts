import { ReadModelConfig } from "../types";
import { DatabaseClient } from "estk-pg";
import { EventStore } from "estk-events";
import EventApplier from '../event_applier';
import applyEventsToTempTable from './apply_events_to_temp_table';
import copyToTable from './copy_to_table';
import createTempTable from './create_temp_table';

const rebuild = async (
  config: ReadModelConfig,
  client: DatabaseClient,
  eventStore: EventStore
) => {
    const tempTableName = await createTempTable(client, config);
    const eventStream = await eventStore.getEventStream({});
    await applyEventsToTempTable(config, client, eventStream, tempTableName);
    await copyToTable(client, config, tempTableName);
//    await dropTempTable(tempTableName);
}

export default rebuild;
