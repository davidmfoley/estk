import eventPublishTests from './event_publish.test';
import eventStreamOrderingTests from './event_stream_ordering.test';
import eventQueryingTests from './event_querying.test';

export default function tests(startStore: any) {
  eventPublishTests(startStore);
  eventStreamOrderingTests(startStore);
  eventQueryingTests(startStore);
}
