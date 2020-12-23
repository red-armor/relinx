const errors: {
  [key: number]: Function | string;
} = {
  10001: (error: Error, type: string) => {
    return `process effect action ${type} with error: \n ${error.message}`;
  },
};

const error = (code: number, ...args: Array<any>) => {
  const e = errors[code];
  const message = typeof e === 'function' ? e.apply(null, args) : e;
  const err = new Error(`[relinx] ${message}`);

  if (args[0] instanceof Error) {
    err.name = args[0].name;
  }
  throw err;
};

export default error;
