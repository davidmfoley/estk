## estk-events-pg

Simple postgresql client used by other estk modules.

### PostgresClient(databaseUrl)

Create a client by passing a valid postgres url

#### query(sql, params)

returns an array of objects, one per row

#### transaction()

starts a transaction and returns a wrapper

### PostgresTransaction

#### query(sql, params)

run a query in the transaction scope

#### commit()

commit the transaction

#### rollback()

rollback the transaction

usage: 

```javascript

  const { EventStore } = require('estk-events');
  const { PostgresClient } = require('estk-pg');
  const client = PostgresClient('postgres://localhost/db-name');
  const [result] = await client.query('select 42 as answer');
  console.log(result); // => { answer: 42 }

  const transaction = await client.transaction();
  await transaction.query('create table people(name text)');
  await transaction.query(`insert into people(name) values('Arthur')`);
  const rows = await transaction.query(`select * from people`);
  console.log(rows); // => [ { name: "Arthur" } ];
  await transaction.rollback()
```
