import url from 'url';
import Debug from 'debug';
import pg, { Pool, QueryResult } from 'pg';
import PostgresTransaction from './transaction';
import { ResultSet, DatabaseClient, DatabaseQuery } from './types';
import wrapQuery from './wrap_query';

const debug = Debug('estk-pg.client');

type PostgresConfig = {
  url: string;
  poolSize?: number;
};

type Connection = {
  client: DatabaseClient;
  done: Function;
};

export default function init(
  dbConfig: PostgresConfig
): Promise<DatabaseClient> {
  pg.defaults.poolSize = dbConfig.poolSize || 10;

  if (dbConfig.url) {
    return db(dbConfig);
  } else {
    debug(
      'configuration error! Could not connect to database! no URL specfied!'
    );
    return Promise.reject(
      new Error('Configuration error - could not connect to db')
    );
  }
}

function wrap(client: pg.PoolClient, txPool: pg.Pool): DatabaseClient {
  return {
    query: wrapQuery(client.query.bind(client), debug),
    transaction: () => PostgresTransaction(txPool),
    close: async () => {
      client.release();
    },
  };
}

function parseUrl(databaseUrl: string) {
  var settings: any = {};
  var dbUrl = url.parse(databaseUrl);

  if (dbUrl.auth) {
    var auth = dbUrl.auth.split(':');
    settings.user = auth[0];
    settings.password = auth[1];
  }

  settings.host = dbUrl.hostname;
  settings.port = dbUrl.port;
  settings.database = (dbUrl.pathname || '').substring(1);
  return settings;
}

function createPool(name: string, url: string) {
  var settings = parseUrl(url);
  return new Pool(settings);
}

function db(dbConfig: PostgresConfig): Promise<DatabaseClient> {
  const txPool = createPool('tx', dbConfig.url);
  const nontxPool = createPool('nontx', dbConfig.url);
  pg.types.setTypeParser(1184, stringValue => stringValue);
  pg.types.setTypeParser(1114, stringValue => stringValue);
  pg.types.setTypeParser(1700, parseFloat); // convert bigints to JS int (needed because COUNT returns a bigint)

  pg.types.setTypeParser(20, function(val) {
    return parseInt(val, 10);
  });

  const query = wrapQuery(nontxPool.query.bind(nontxPool), debug);
  const database = {
    transaction: () => PostgresTransaction(txPool),
    query,
    close: async () => {
      await txPool.end();
      await nontxPool.end();
    },
  };

  return query({
    sql: 'select 1',
  }).then(() => database);
}
