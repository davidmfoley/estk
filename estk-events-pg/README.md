## estk-events-pg

postgresql storage for estk events

setup: 
```javascript
  const { EventStore } = require('estk-events');
  const { PostgresClient, PostgresqlEventStorage } = require('estk-events-pg');

  const client = await PostgresClient(config);
  const storage: any = await PostgresEventStorage(client);
  const store = await EventStore({ storage });
```
