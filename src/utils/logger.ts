const errors: {
  [key: number]: Function | string;
} = {
  10001: (error: Error, type: string) => {
    return `process effect action ${type} with error: \n ${error.message}`;
  },
  10002: `model key should be defined before used to transfer`,
  10003: `resolveActions failed`,
};

const warnings: {
  [key: number]: Function | string;
} = {
  20001: (from: string, to: string) => {
    return `Model key ${from} has been delegated with ${to}`;
  },
  20002: (type: string) => {
    return `Effect ${type} is dispatch before store is created. This may become a potential bug`;
  },
  20003: (type: string) => {
    return `Maybe you have dispatched an unregistered model's effect action(${type})`;
  },
  20004: (type: string) => {
    return `Maybe you have defined an non-exist action ${type}`;
  },
  20005: (type: string) => {
    return `Effect ${type} is dispatch before store is created in synthetic mode. This may become a potential bug`;
  },
  20006: (key: string, autoRunKey: string) => {
    return (
      `Error happens when initialize '${key}/${autoRunKey}' subscription\n` +
      'It may has following reason: \n' +
      '   1. Attempt to access an dynamic model but it not injected yet.\n' +
      '   2. May access a not existing model \n\n' +
      'If it is condition 1, please reconsider whether model deps is reasonable !!!\n\n' +
      'However, the following solution is not recommended: \n\n' +
      'subscriptions: {\n' +
      '  setup: ({ getState }) => { \n' +
      '    const { headerBar } = getState()\n' +
      '    if (headerBar) return null\n' +
      '    console.log(headerBar.value) \n' +
      '  },\n' +
      '}\n\n' +
      'It only could be consider as temp fix and may has potential bug'
    );
  },
  20007: (actions: any, storeKey: string) => {
    let str = '';

    [].concat(actions).forEach(action => {
      const { type } = action;
      str += `\n    ${type},`;
    });
    return (
      `Subscription derived action ${str}\n` +
      `is triggered by value change in ${storeKey}.\n\n` +
      `Maybe it is an reasonable logic, but take care to avoid circular call.\n`
    );
  },
  20008: (actions: any) => {
    let str = '';

    [].concat(actions).forEach(action => {
      const { type } = action;
      str += `\n    ${type},`;
    });

    return (
      `Dispatch is an unsafe operation in subscription. In order to avoid\n` +
      `circular call you'd better dispatch to self model.\n\n` +
      `Please consider again following actions : ${str}`
    );
  },
};

const NODE_ENV = process.env.NODE_ENV;

const error = (code: number, ...args: Array<any>) => {
  const e = errors[code];
  const message = typeof e === 'function' ? e.apply(null, args) : e;
  const err = new Error(`[relinx] ${message}`);

  if (args[0] instanceof Error) {
    err.name = args[0].name;
  }

  if (NODE_ENV !== 'production') {
    console.log(err);
    return;
  }

  throw err;
};

const warn = (code: number, ...args: Array<any>) => {
  const e = warnings[code];
  const message = typeof e === 'function' ? e.apply(null, args) : e;
  const err = `[relinx warning] ${message}`;

  if (NODE_ENV !== 'production') {
    console.warn(err);
  }
};

export { error, warn };
