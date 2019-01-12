```
  import PostgresSnapshotStorage from '../src/snapshot_storage';
  import { PostgresClient } from 'estk-pg';

  const client = await PostgresClient({
    url: process.env.DATABASE_URL
  });

  const Widget = PostgresSnapshotStorage({ client, tableName: 'widget' + Date.now() });
```
