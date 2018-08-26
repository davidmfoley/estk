// @flow
import type { EventStore, Event } from 'estk-events/types';
import amqplib from 'amqplib';
import events from 'events';

type AmqpConfig = {
  url?: string,
  exchange?: string
};

export default async (store: EventStore, config: AmqpConfig = {}) => {
  const emitter = new events.EventEmitter();
  const connection = await amqplib.connect(config.url);

  const channel = await connection.createChannel();
  const exchange = config.exchange || 'estk-events';
  await channel.assertExchange(exchange, 'topic');
  const opts = {autoDelete: true, durable: false};
  const queue = await channel.assertQueue('', opts);
  await channel.bindQueue(queue.queue, exchange, 'estk-event'); 
  channel.consume(queue.queue, onAmqpMessage);

  store.onPublished((events: Event[]) => {
    const message = new Buffer(JSON.stringify(events));
    channel.publish(exchange, 'estk-event', message);
  });

  return {
    onPublished,
    close
  };

  function onAmqpMessage(message) {
    const events = JSON.parse(message.content.toString('utf-8'));
    notifyListeners(events);
  }

  function notifyListeners(events: Event[]) {
    events.forEach(emitter.emit.bind(emitter, 'publish'));
  }

  function onPublished(fn) {
    emitter.on('publish', fn);
  }

  async function close() {
    await channel.close();
    await connection.close();
  }
};
