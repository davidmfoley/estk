
module.exports = function tests(startStore) {
  require('./event_publish.test')(startStore);
  require('./event_stream_ordering.test')(startStore);
  require('./event_querying.test')(startStore);
}
