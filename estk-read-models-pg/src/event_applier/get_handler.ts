import { Event } from 'estk-events';
import { ReadModelConfig } from '../types';

export default (
  { events }: ReadModelConfig,
  event: Event
): Function | undefined => {
  if (typeof events === 'undefined') return;
  if (typeof events === 'function') return events;

  const typeHandler = events[event.targetType];

  if (!typeHandler) return;

  if (typeof typeHandler === 'function') {
    return typeHandler;
  }

  const actionHandler = typeHandler[event.action];

  if (typeof actionHandler === 'function') {
    return actionHandler;
  }
};
