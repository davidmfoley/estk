// @flow
import { ReadModelConfig } from '../types';
import { QueryContext } from 'estk-pg/types';
import Actions from './actions';
import getHandler from './get_handler';

export default (config: ReadModelConfig, context: QueryContext) => {
  const actions = Actions(config, context);

  return async (event: Event) => {
    const handler = getHandler(config, event);
    if (!handler) return;
    await handler(event, actions);
    return event;
  };
};
