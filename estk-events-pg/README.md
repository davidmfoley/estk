## estk-events-pg

postgresql storage for estk events

### PostgresqlClient

### PostgresqlEventStorage

usage: 

```javascript

  const { EventStore } = require('estk-events');
  const { PostgresClient, PostgresqlEventStorage } = require('estk-events-pg');

  // client config
  const client = await PostgresClient({
    url: 'postgres://localhost/estk',
    // optional: number of connections
    poolSize: 10
  };

  const storage: any = await PostgresEventStorage(client);
  const store = await EventStore({ storage });
```
