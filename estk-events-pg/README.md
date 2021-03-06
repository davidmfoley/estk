## estk-events-pg

postgresql storage for estk events

### PostgresqlEventStorage

Event storage backed by a postgres database.


usage:

```javascript
  const { createEventStore } = require('estk-events');
  const { PostgresClient } = require('estk-pg');
  const { PostgresEventStorage } = require('estk-events-pg');

  // client config
  const client = await PostgresClient({
    url: 'postgres://localhost/estk',
    // optional: number of connections
    poolSize: 10
  };

  const storage = await PostgresEventStorage(client);
  const store = await createEventStore({ storage });

  await store.publish({
    targetType: 'sandwich',
    targetId: '42',
    action: 'make',
    data: {
      flavor: 'roast beast'
    }
  });

  const eventStream = await store.getEventStream();
  const sandwichCount = await eventStream.reduce((count, action) => count++, 0);
```
