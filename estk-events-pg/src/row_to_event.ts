import { Event } from 'estk-events'

export default function rowToEvent(row: any): Event {
  const { id, timestamp, target_type, target_id, action, data, meta } = row
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
