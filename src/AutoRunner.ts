import { AutoRunnerProps } from './types';

let count = 1;
class AutoRunner {
  public paths: Array<Array<string>>;
  public autoRunFn: Function;
  public id: string;

  constructor({ paths, autoRunFn }: AutoRunnerProps) {
    this.id = `autoRunner_${count++}`;
    this.paths = paths;
    this.autoRunFn = autoRunFn;
  }

  addRemover() {}

  markDirty() {}

  triggerAutoRun() {
    return this.autoRunFn() || [];
  }
}

export default AutoRunner;
