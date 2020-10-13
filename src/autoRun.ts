import invariant from 'invariant';
import Application from './Application';
import AutoRunner from './AutoRunner';

const autoRun = <T, K extends keyof T>(
  fn: Function,
  application: Application<T, K>
) => {
  invariant(application, 'application is required to be initialized already !');

  const state = application.proxyState;

  state.enter();
  fn({ state });
  const tracker = state.getContext().getCurrent();
  const paths = tracker.getRemarkable();

  const autoRunner = new AutoRunner({
    paths,
    autoRunFn: fn,
  });

  application.addAutoRunner(autoRunner);

  console.log('paths ', paths);

  state.leave();
};

export default autoRun;
