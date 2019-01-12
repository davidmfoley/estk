//@flow
import type { Event } from 'estk-events';

export default (handlers: Object, event: Event): ?Function => {
  if (typeof handlers === 'function') return handlers;

  const typeHandler = handlers[event.targetType];
  if (!typeHandler) return;

  if (typeof typeHandler === 'function') {
    return typeHandler;
  }

  const actionHandler = typeHandler[event.action];
  if (typeof actionHandler === 'function') {
    return actionHandler;
  }
};
