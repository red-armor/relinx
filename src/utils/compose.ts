// https://github.com/reduxjs/redux/blob/master/src/compose.ts

export default function compose(...funcs: Array<Function>) {
  if (funcs.length === 0) {
    return (arg: any) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args: Array<Function>) => a(b(...args)));
}
