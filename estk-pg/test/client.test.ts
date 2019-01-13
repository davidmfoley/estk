import { describe, beforeEach, it } from 'mocha';
import { DatabaseClient } from '../src/types';
import PostgresClient from '../src/client';
import { expect } from 'chai';

describe('postgres client', () => {
  let client: DatabaseClient;

  async function getClient() {
    const config = {
      url: process.env.DATABASE_URL_TEST || '',
      poolSize: 10
    };
    return await PostgresClient(config);
  }

  beforeEach(async () => {
    client = await getClient();
  });

  it('can do queries and stuff', async () => {
    await client.query({
      sql: 'drop table if exists client_test'
    });
    await client.query({
      sql: 'create table client_test(id varchar)'
    });
    await client.query({
      sql: `insert into client_test(id) values('a')`
    });
    await client.query({
      sql: `insert into client_test(id) values('b')`
    });
    const rows = await client.query({
      sql: `select * from client_test order by id`
    });
    expect(rows.length).to.eq(2);
    expect(rows[0].id).to.eq('a');
    expect(rows[1].id).to.eq('b');
  });

  describe('transactions', async () => {
    beforeEach(async () => {
      await client.query({
        sql: 'drop table if exists client_test'
      });
      await client.query({
        sql: 'create table client_test(id varchar)'
      });
    });
    it('handles commit', async () => {
      let transaction = await client.transaction();
      await transaction.query({
        sql: `insert into client_test(id) values('a')`
      });
      let insideTransaction = await transaction.query({
        sql: `select count(*) as row_count from client_test`
      });
      expect(insideTransaction[0].row_count).to.eq(1);
      let duringTransaction = await client.query({
        sql: `select count(*) as row_count from client_test`
      });
      expect(duringTransaction[0].row_count).to.eq(0);
      await transaction.commit();
      let afterTransaction = await client.query({
        sql: `select count(*) as row_count from client_test`
      });
      expect(afterTransaction[0].row_count).to.eq(1);
    });
    it('handles rollback', async () => {
      let transaction = await client.transaction();
      await transaction.query({
        sql: `insert into client_test(id) values('a')`
      });
      await transaction.rollback();
      let afterRollback = await client.query({
        sql: `select count(*) as row_count from client_test`
      });
      expect(afterRollback[0].row_count).to.eq(0);
    });
  });
});
