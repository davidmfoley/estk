import { Event } from 'estk-events';
import { ReadModelConfig } from '../types';
import { QueryContext } from 'estk-pg';
import Actions from './actions';
import getHandler from './get_handler';

type EventApplier = (e: Event) => Promise<Event | undefined>

export default ((config: ReadModelConfig, context: QueryContext): EventApplier => {
  const actions = Actions(config, context);
  return async (event: Event): Promise<Event | undefined> => {
    const handler = getHandler(config, event);
    if (!handler) return;
    await handler(event, actions);
    return event;
  };
});
