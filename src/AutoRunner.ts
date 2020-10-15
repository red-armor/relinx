import { AutoRunnerProps } from './types';

let count = 1;
class AutoRunner {
  private _isDirty: boolean;
  public paths: Array<Array<string>>;
  public autoRunFn: Function;
  public id: string;
  public removers: Array<Function>;

  constructor({ paths, autoRunFn }: AutoRunnerProps) {
    this.id = `autoRunner_${count++}`;
    this.paths = paths;
    this.autoRunFn = autoRunFn;
    this._isDirty = false;
    this.removers = [];
  }

  addRemover(remover: Function) {
    this.removers.push(remover);
  }

  teardown() {
    this.removers.forEach(remover => remover());
    this.removers = [];
  }

  markDirty() {
    this._isDirty = true;
  }

  markClean() {
    this._isDirty = false;
  }

  isDirty(): boolean {
    return this._isDirty;
  }

  triggerAutoRun() {
    return this.autoRunFn() || [];
  }
}

export default AutoRunner;
