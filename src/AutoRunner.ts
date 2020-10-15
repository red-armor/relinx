import { AutoRunnerProps, Action } from './types';

let count = 1;
class AutoRunner {
  private _isDirty: boolean;
  public paths: Array<Array<string>>;
  public autoRunFn: Function;
  public id: string;
  public removers: Array<Function>;
  public modelKey: string;

  constructor({ paths, autoRunFn, modelKey }: AutoRunnerProps) {
    this.id = `autoRunner_${count++}`;
    this.paths = paths;
    this.autoRunFn = autoRunFn;
    this._isDirty = false;
    this.removers = [];
    this.modelKey = modelKey;
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
    const actions = (this.autoRunFn() || []) as Array<Action>;
    return actions.map(action => {
      const { type, payload } = action;
      // if type is not in `namespace/type` format, then add modelKey as default namespace.
      if (!/\//.test(type)) {
        return {
          type: `${this.modelKey}/${type}`,
          payload,
        };
      }
      return action;
    });
  }
}

export default AutoRunner;
