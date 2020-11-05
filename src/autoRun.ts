import invariant from 'invariant';
import Application from './Application';
import AutoRunner from './AutoRunner';
import { Action } from './types';

const autoRun = <T, K extends keyof T>(
  fn: Function,
  application: Application<T, K>,
  modelKey: string
): Array<Action> => {
  invariant(application, 'application is required to be initialized already !');

  const state = application.proxyState;

  state.strictEnter();
  // set autoRun params
  const initialActions = [].concat(fn({ getState: application.getState }));

  const tracker = state.getContext().getCurrent();
  const paths = tracker.getRemarkable();

  const autoRunner = new AutoRunner({
    paths,
    modelKey,
    autoRunFn: () => {
      // to avoid data back stream when using autoRunFn trigger calculate..
      state.strictEnter();
      const actions = fn({ getState: application.getState });
      const tracker = state.getContext().getCurrent();
      const paths = tracker.getRemarkable();
      autoRunner.paths = paths;
      application.addAutoRunner(autoRunner);
      state.leave();
      return actions;
    },
  });

  application.addAutoRunner(autoRunner);

  state.leave();

  const nextActions = initialActions.map(action => {
    const { type, payload } = action;
    if (!/\//.test(type)) {
      return {
        type: `${modelKey}/${type}`,
        payload,
      };
    }
    return action;
  });

  return nextActions;
};

export default autoRun;
