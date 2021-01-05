import invariant from 'invariant';
import { StateTrackerUtil } from 'state-tracker';
import Application from './Application';
import AutoRunner from './AutoRunner';
import { Action, BasicModelType } from './types';

const autoRun = <T extends BasicModelType<T>, K extends keyof T>(
  fn: Function,
  application: Application<T, K>,
  modelKey: string
): Array<Action> => {
  invariant(application, 'application is required to be initialized already !');

  const state = application.proxyState;

  StateTrackerUtil.enter(state);
  // set autoRun params
  const initialActions = [].concat(fn({ getState: application.getState }));

  const tracker = StateTrackerUtil.getContext(state).getCurrent();
  const paths = tracker.getRemarkable();

  const autoRunner = new AutoRunner({
    paths,
    modelKey,
    autoRunFn: () => {
      // to avoid data back stream when using autoRunFn trigger calculate..
      StateTrackerUtil.enter(state);
      const actions = fn({ getState: application.getState });
      const tracker = StateTrackerUtil.getContext(state).getCurrent();
      const paths = tracker.getRemarkable();
      autoRunner.paths = paths;
      application.addAutoRunner(autoRunner);
      StateTrackerUtil.leave(state);
      return actions;
    },
  });

  application.addAutoRunner(autoRunner);

  StateTrackerUtil.leave(state);

  const nextActions = [] as Array<Action>;
  initialActions.forEach(action => {
    if (!action) return;
    const { type, payload } = action;
    if (!type) return;

    if (!/\//.test(type)) {
      nextActions.push({
        type: `${modelKey}/${type}`,
        payload,
      });
    }
    nextActions.push(action);
  });

  return nextActions;
};

export default autoRun;
