// @flow
import { afterEach, beforeEach, describe, it } from 'mocha';
import { InMemoryEventStorage } from 'estk-events-in-memory';
import { EventStore } from 'estk-events';
import AmqpMessageBus from '../src/amqp_message_bus';

describe('amqp connector', () => {
  let first, second;

  const exampleEvent = {
    targetType: 'test-type',
    targetId: 'test-id',
    action: 'test-action'
  };

  beforeEach(async () => {
    first = await connect();
    second = await connect();
  });

  afterEach(async () => {
    await first.close();
    await second.close();
  });

  it('relays published events', () => {
    return new Promise(resolve => {
      first.onPublished(resolve);
      second.publish(exampleEvent);
    });
  });

  it('handles locally published events', () => {
    return new Promise(resolve => {
      first.onPublished(resolve);
      first.publish(exampleEvent);
    });
  });

  async function connect() {
    const storage = InMemoryEventStorage();

    const eventStore = await EventStore({ storage });
    const bus = await AmqpMessageBus(eventStore);

    return {
      close: bus.close,
      publish: eventStore.publish,
      onPublished: bus.onPublished
    };
  }
});
