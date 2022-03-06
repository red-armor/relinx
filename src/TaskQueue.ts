type Task = {
  run: Function;
  next: Function;
  cancel: Function;
};

export default class TaskQueue {
  private _queue: Array<Task> = [];
  // private _scheduler: Function = (fn: Function) => fn.call(null)
  private _current: Task | undefined | null;

  private _after?: Function;
  private _task: Array<Function> = [];

  private _pending: boolean = false;

  constructor({ after }: { after?: Function }) {
    this._after = after;
  }

  nextTick(fn: Function) {
    this._task.push(fn);

    if (!this._pending) {
      this._pending = true;
      this.flushAsync();
    }
  }

  flush() {
    let result: any = [];
    const copy = this._task.slice(0);
    this._task = [];

    copy.forEach(task => {
      const changedValues = task() || [];
      result = result.concat(changedValues);
    });

    if (result.length && this._after) {
      this._after(result);
    }

    if (this._task.length) this.flushAsync();
    else this._pending = false;
  }

  flushAsync() {
    Promise.resolve().then(() => {
      this.flush();
    });
  }

  schedule(fn: (task: Task) => void) {
    this._queue.push(this.genTask(fn));

    if (this._pending) {
      this._pending = true;
      this.flushAsync();
    }

    // if (this.getCurrent()) {
    // } else {
    //   this.genTask(fn).run();
    // }
  }

  run() {}

  getCurrent() {
    return this._current;
  }

  genTask(func: Function) {
    const self = this;
    let cancelled = false;

    const task = {
      run: () => {
        func.call(null, {
          next: task.next,
        });
      },

      next: () => {
        if (!cancelled) self.next();
      },

      cancel: () => {
        cancelled = true;
      },
    };
    return task;
  }

  next() {
    if (this._queue.length) {
      this._current = this._queue.shift();
      if (this._current) this._current.run();
    } else {
      this._current = null;
    }
  }
}
