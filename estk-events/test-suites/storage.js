
module.exports = function tests(startStore) {
  require('../test/storage/event_publish.test')(startStore);
  require('../test/storage/event_stream_ordering.test')(startStore);
  require('../test/storage/event_querying.test')(startStore);
}
