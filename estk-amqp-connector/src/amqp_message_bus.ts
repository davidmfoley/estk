// @flow
import { EventStore, Event } from 'estk-events';
import amqplib from 'amqplib';
import events from 'events';

type AmqpConfig = {
  url?: string;
  exchange?: string;
};

export default async (
  store: EventStore,
  config: AmqpConfig = {}
): Promise<any> => {
  const emitter = new events.EventEmitter();
  const connection = await amqplib.connect(config.url as string);
  const channel = await connection.createChannel();
  const exchange = config.exchange || 'estk-events';

  await channel.assertExchange(exchange, 'topic');

  const opts = {
    autoDelete: true,
    durable: false
  };
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

  function onAmqpMessage(message: any) {
    const events = JSON.parse(message.content.toString('utf-8'));
    notifyListeners(events);
  }

  function notifyListeners(events: Event[]) {
    events.forEach(emitter.emit.bind(emitter, 'publish'));
  }

  function onPublished(fn: (...argsA: any) => void) {
    emitter.on('publish', fn);
  }

  async function close() {
    await channel.close();
    await connection.close();
  }
};
