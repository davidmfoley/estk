## estk-events-in-memory

In-memory, non-durable storage for estk EventStore
Useful for testing and/or prototyping.

## InMemoryEventStorage

usage:

```javascript
  const { InMemoryEventStorage } = require('estk-events-in-memory');
  const { EventStore } = require('estk-events');

  const store = await EventStore(InMemoryStorage());

  await store.publish({
    targetType: 'example-type',
    targetId: 'example-id',
    action: 'example-action',
    data: { hello: 'world'}
  });

  const stream = await store.getEventStream({});

  let event;
  do {
    event = await stream.next();
    console.log(event);
  } while (!event.ended);

```
