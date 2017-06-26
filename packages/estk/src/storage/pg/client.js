// @flow

import pg from 'pg';
import url from 'url';
import Debug from 'debug';
import PostgresTransaction from './transaction';

const debug = Debug('Postgres');
const Pool = pg.Pool;


type PostgresConfig = {
  url: string,
  poolSize: ?number,
}

type Connection = {
  client: any,
  done: Function
}

import type { ResultSet, DatabaseClient } from '../types'

let txPool;
let nontxPool;

export default function init(dbConfig: PostgresConfig): Promise<DatabaseClient> {
  pg.defaults.poolSize = dbConfig.poolSize || 10;
  if (dbConfig.url) {
    return db(dbConfig);
  }
  else {
    debug('configuration error! Could not connect to database! no URL specfied!');
    return Promise.reject(new Error('Configuration error - could not connect to db'));
  }
}

function wrap(client: any): DatabaseClient {
  return {
    query: function(sql: string, params?: any[]): Promise<ResultSet> {
      return new Promise((resolve, reject) => {
        params = params || [];
        let start = new Date();
        client.query(sql, params, function(err, result) {
          var elapsed = new Date() - start;
          debug(sql, elapsed +'ms', err || 'success', result && result.rowCount);
          if (err) return reject(err)
          resolve(result);
        });
      });
    }
  };
}

function parseUrl(databaseUrl: string) {
  var settings = {};
  var dbUrl = url.parse(databaseUrl);

  if (dbUrl.auth) {
    var auth = dbUrl.auth.split(":");
    settings.user = auth[0];
    settings.password = auth[1];
  }

  settings.host = dbUrl.hostname;
  settings.port = dbUrl.port;
  settings.database = (dbUrl.pathname || '').substring(1);

  return settings;
}

function createPool(name, url) {
  var settings = parseUrl(url);
  return new Pool(settings);
}

function db(dbConfig: PostgresConfig): Promise<DatabaseClient> {
  txPool = txPool || createPool('tx', dbConfig.url);
  nontxPool = nontxPool || createPool('nontx', dbConfig.url);

  pg.types.setTypeParser(1184, stringValue => stringValue);
  pg.types.setTypeParser(1114, stringValue => stringValue);

  pg.types.setTypeParser(1700, parseFloat);

  // convert bigints to JS int (needed because COUNT returns a bigint)
  pg.types.setTypeParser(20, function(val) {
    return parseInt(val, 10);
  });

  function connect(): Promise<Connection> {
    return new Promise((resolve, reject) => {
      nontxPool.connect(function(err, client, done) {
        if (err) return reject(err);

        resolve({ client: wrap(client), done });
      });
    });
  }

  const database = {
    connect,
    transaction: () => PostgresTransaction(txPool),
    query
  };


  return query('select 1').then(() => database);

  function query(sql: string, params?: Array<any>): Promise<ResultSet> {
    return connect().then(({client, done}) => {
      debug(sql, params);
      return client.query(sql, params).then(result => {
        done();
        return result && result.rows || [];
      }, err => {
        debug("SQL Error: " + err.message, sql);
        done();
        throw err;
      });
    });
  }
}


