export default function rowToEvent(row) {
  const { id, timestamp, target_type, target_id, action, data, meta} = row;

  return {
    id,
    timestamp,
    targetType: target_type,
    targetId: target_id,
    action,
    data,
    meta,
  }
}
