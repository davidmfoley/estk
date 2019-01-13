## estk-amqp-connector

Connect multiple applications using estk event stores so that they receive notifications when new events are published.

For example, with multiple load-balanced websocket servers, this can be used to distribute events to each server so that then can notify the conected clients of events that pertain to them.

NB: Does not handle bookmarking and is not durable.

### AmqpMessageBus

```javascript
  const { InMemoryEventStorage } = require('estk-events-in-memory');
  const { createEventStore } = require('estk-events');
  const { AmqpMessageBus } = require('estk-amqp-connector');

  const amqpConfig = {
    // url defaults to localhost
    // you probably want to set to something else in production
    url: 'amqp://guest:guest@localhost:5672',
    // exchange is optional, defaults to estk-events
    exchange: 'estk-amqp-example'
  };

  const storeA = await createEventStore(InMemoryStorage());
  const listenerA = await AmqpMessageBus(eventStore, amqpConfig);
  listenerA.onPublished(events => console.log('A was notified', events));

  const storeB = await createEventStore(InMemoryStorage());
  const listenerB = await AmqpMessageBus(eventStore, amqpConfig);
  listenerB.onPublished(events => console.log('B was notified', events));

  await storeA.publish({
    targetType: 'example-type',
    targetId: 'example-id',
    action: 'example-action',
    data: { sender: 'A'}
  });

  await storeB.publish({
    targetType: 'example-type',
    targetId: 'example-id',
    action: 'example-action',
    data: { sender: 'B'}
  });

  setTimeout(async () => {
    await storeA.close();
    await storeB.close();

  }, 1000);
```
