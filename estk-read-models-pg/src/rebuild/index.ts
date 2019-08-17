import { ReadModelConfig } from "../types";
import { DatabaseClient } from "estk-pg";
import { EventStore } from "estk-events";
import applyEventsToTempTable from './apply_events_to_temp_table';
import copyToTable from './copy_to_table';
import createTempTable from './create_temp_table';
import dropTempTable from './drop_temp_table';

const rebuild = async ({model, client, eventStore}: {
  model: ReadModelConfig,
  client: DatabaseClient,
  eventStore: EventStore
}) => {
    const tempTableName = await createTempTable(client, model);
    const eventStream = await eventStore.getEventStream({});
    await applyEventsToTempTable(model, client, eventStream, tempTableName);
    await copyToTable(client, model, tempTableName);
    await dropTempTable(client, tempTableName);
}

export default rebuild;
