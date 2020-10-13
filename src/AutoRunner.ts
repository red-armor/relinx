import { AutoRunnerProps } from './types';

class AutoRunner {
  public paths: Array<Array<string>>;
  public autoRunFn: Function;

  constructor({ paths, autoRunFn }: AutoRunnerProps) {
    this.paths = paths;
    this.autoRunFn = autoRunFn;
  }
}

export default AutoRunner;
