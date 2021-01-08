const errors: {
  [key: number]: Function | string;
} = {
  10001: (error: Error, type: string) => {
    return `process effect action ${type} with error: \n ${error.message}`;
  },
  10002: `model key should be defined before used to transfer`,
  10003: `resolveActions failed`,
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

export default error;
