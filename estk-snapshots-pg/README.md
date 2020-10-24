```
  import { PostgresSnapshotStorage } from 'estk-snapshots-pg';
  import { PostgresClient } from 'estk-pg';

  const client = await PostgresClient({
    url: process.env.DATABASE_URL
  });

  const Widget = PostgresSnapshotStorage({ client, tableName: 'widget' + Date.now() });
```
