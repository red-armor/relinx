import isPlainObject from './isPlainObject';
import { formatTime } from '../middleware/logger/utils';
import { ActivityToken } from 'state-tracker';

const errors: {
  [key: number]: Function | string;
} = {
  10001: (error: Error, type: string) => {
    return `process effect action ${type} with error: \n ${error.message}`;
  },
  10002: `model key should be defined before used to transfer`,
  10003: `resolveActions failed`,
  // @ts-ignore
  10004: (error: Error, type: string) => {
    return `subscription ${type} function run failed`;
  },
};

const infos: {
  [key: number]: Function | string;
} = {
  30001: (
    componentName: string,
    values: {
      [key: string]: any;
    }
  ) => {
    const { action } = values;

    let type = '';

    if (action === 'isPropsEqual') {
      type = 'props';
    } else if (action === 'isStateEqual') {
      type = 'state';
    }

    const message = `${type} changed rerender - ${componentName}`;

    return {
      title: '[relinx info]',
      message,
      values,
      color: '#ff4d4f',
    };
  },
  30002: (
    componentName: string,
    values: {
      [key: string]: any;
    }
  ) => {
    const { action } = values;

    let type = '';

    if (action === 'isPropsEqual') {
      type = 'props';
    } else if (action === 'isStateEqual') {
      type = 'state';
    }

    const message = `${type} changed rerun - ${componentName}`;

    return {
      title: '[relinx info]',
      message,
      values,
      color: '#f759ab',
    };
  },
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
  20009: (componentName: string, type: string) => {
    return {
      title: '[relinx component rerender warning]',
      message: `${type} changed - ${componentName}`,
      color: '#ff7a45',
    };
  },
  20010: (subscriptionName: string, type: string) => {
    return {
      title: '[relinx subscription rerun warning]',
      message: `${type} changed - ${subscriptionName}`,
      color: '#ff7a45',
    };
  },
};

const NODE_ENV = process.env.NODE_ENV;

export const errorWarning = (code: number, ...args: Array<any>) => {
  const e = errors[code];
  const message = typeof e === 'function' ? e.apply(null, args) : e;
  const err = new Error(`[relinx] ${message}`);

  if (args[0] instanceof Error) {
    err.name = args[0].name;
    err.stack = args[0].stack;
  }

  if (NODE_ENV !== 'production') {
    console.log(err);
    return;
  }
};

const error = (code: number, ...args: Array<any>) => {
  const e = errors[code];
  const message = typeof e === 'function' ? e.apply(null, args) : e;
  const err = new Error(`[relinx] ${message}`);

  if (args[0] instanceof Error) {
    err.name = args[0].name;
    err.stack = args[0].stack;
  }

  if (NODE_ENV !== 'production') {
    console.error(err);
    return;
  }

  throw err;
};

// const info = (code: number, ...args: Array<any>) => {
//   if (NODE_ENV === 'production') {
//     return;
//   }
//   const e = infos[code];
//   const result = typeof e === 'function' ? e.apply(null, args) : e;
//   let color = '#52c41a';
//   let title = '[relinx info]';
//   let message = result;

//   if (isPlainObject(result)) {
//     color = result.color ? result.color : color;
//     title = result.title ? result.title : title;
//     message = result.message ? result.message : message;
//     console.log('info ', result.values)
//   }

//   console.log(`%c${title} ${message}`, `color: ${color}`);
// };
const colorLine = Function.apply.bind(console.log, null); // eslint-disable-line
const colorGroupEnd = console.groupEnd; // eslint-disable-line
const colorGroupCollapsed = Function.apply.bind(console.groupCollapsed, null); // eslint-disable-line
const colorLog = (group: Array<Array<string>>) => {
  const { text: t, styles: s } = group.reduce(
    (acc, cur) => {
      const { text, styles } = acc;
      const [subText, subStyle] = cur;

      return {
        text: `${text}%c ${subText}`,
        styles: ([] as Array<string>).concat(styles, subStyle),
      };
    },
    {
      text: '',
      styles: [] as Array<string>,
    }
  );

  return [t, ...s];
};

const warn = (code: number, ...args: Array<any>) => {
  if (NODE_ENV === 'production') {
    return;
  }
  const e = warnings[code];
  const result = typeof e === 'function' ? e.apply(null, args) : e;
  let color = '#fff566';
  let title = '[relinx warning]';
  let message = result;

  if (isPlainObject(result)) {
    color = result.color ? result.color : color;
    title = result.title ? result.title : title;
    message = result.message ? result.message : message;
  }

  const parts = [];
  parts.push([title, `color: ${color}; font-weight: bold`]);
  parts.push([message, 'color: #ff4d4f']);
  colorLine(colorLog(parts));
};

const infoChangedValue = (code: number, ...args: Array<any>) => {
  if (NODE_ENV === 'production') {
    return;
  }

  const e = infos[code];
  const result = typeof e === 'function' ? e.apply(null, args) : e;
  const { title, message, values, color } = result;

  const { action, ...rest } = values;

  const parts = [];
  parts.push([title, 'color: #7cb305; font-weight: bold']);
  parts.push([message, `color: ${color}; font-weight: bold`]);
  parts.push([
    `@ ${formatTime(Date.now())}`,
    'color: gray; font-weight: lighter;',
  ]);
  colorGroupCollapsed(colorLog(parts));
  infoChangeValueContent(rest);
  colorGroupEnd();
};

const contentTitleFixedLength = (str: string, n: number = 9) => {
  const fixed17 = ' '.repeat(n);
  return `${str}${fixed17}`.slice(0, n);
};

const infoChangeValueContent = (values: { [key: string]: any }) => {
  const keys = ['graph', 'diffKey', 'reaction', 'currentValue', 'nextValue'];

  for (let idx = 0; idx < keys.length; idx++) {
    const key = keys[idx];
    let color = '#52c41a';
    let nextKey = key;
    if (key === 'currentValue') {
      color = '#bfbfbf';
      nextKey = 'prevValue';
    } else if (key === 'nextValue') color = '#73d13d';
    else if (key === 'diffKey') color = '#bfbfbf';
    const fixedLengthKey = contentTitleFixedLength(nextKey);
    const style = `color: ${color}; font-weight: bold`;
    const value = values[key];
    colorLine([...colorLog([[fixedLengthKey, style]]), value]);
  }
};

let logActivityStack: Array<ActivityToken> = [];
let topFlag = 0;

const endWith = (str: string, subString: string) =>
  new RegExp(subString, 'i').test(str);

const logActivity = (token: ActivityToken) => {
  if (NODE_ENV === 'production') return;

  const { name, activity } = token;

  if (
    !logActivityStack.length &&
    !endWith(activity, 'start') &&
    !endWith(activity, 'end')
  ) {
    logActivityEntity(token);
    return;
  }

  if (!logActivityStack.length) {
    topFlag++;
    logActivityStack.push(token);
    return;
  }

  const top = logActivityStack[0];
  const { name: topName, activity: topActivity } = top;

  if (name === topName && activity === topActivity) {
    topFlag++;
    logActivityStack.push(token);
    return;
  }

  const topSlug = topActivity.slice(0, -5);
  const slug = activity.slice(0, -3);

  logActivityStack.push(token);

  if (name === topName && topSlug === slug) {
    if (topFlag) topFlag--;
    if (!topFlag) {
      logActivityStack.forEach(token => logActivityEntity(token));
      logActivityStack = [];
    }
  }
};

const logActivityEntity = (token: ActivityToken) => {
  const { name, activity, payload } = token;
  const parts = [];
  parts.push([name, 'color: #7cb305; font-weight: bold']);
  parts.push([activity, `color: #ff4d4f; font-weight: bold`]);
  parts.push([
    `@ ${formatTime(Date.now())}`,
    'color: gray; font-weight: lighter;',
  ]);

  if (/start/i.test(activity)) {
    colorGroupCollapsed(colorLog(parts));
    logActivityPayload(payload);
  } else if (/end/i.test(activity)) {
    payload ? colorGroupCollapsed(colorLog(parts)) : colorLine(colorLog(parts)); // eslint-disable-line
    payload && logActivityPayload(payload);
    payload ? colorGroupEnd() : null; // eslint-disable-line
    colorGroupEnd();
  } else {
    payload ? colorGroupCollapsed(colorLog(parts)) : colorLine(colorLog(parts)); // eslint-disable-line
    payload && logActivityPayload(payload); // eslint-disable-line
    payload ? colorGroupEnd() : null; // eslint-disable-line
  }
};

const logActivityPayload = (payload?: { [key: string]: any }) => {
  if (!payload) return;
  if (isPlainObject(payload)) {
    const keys = Object.keys(payload);
    let maxLength = 0;
    keys.forEach(key => (maxLength = Math.max(maxLength, key.length)));

    for (let idx = 0; idx < keys.length; idx++) {
      const key = keys[idx];
      let color = '#bfbfbf';
      const fixedLengthKey = contentTitleFixedLength(key, maxLength + 1);
      const style = `color: ${color}; font-weight: bold`;
      const value = payload[key];
      colorLine([...colorLog([[fixedLengthKey, style]]), value]);
    }
  }
};

// const logActivity = (token: ActivityToken) => {
//   if (NODE_ENV === 'production') return;

//   const { name, activity, payload } = token;

//   if (payload)
//     console.debug(`[state-tracker activity] ${name} ${activity}`, payload);
//   else console.debug(`[state-tracker activity] ${name} ${activity}`);

//   // if (/start/i.test(activity)) {
//   //   // console.groupCollapsed()
//   //   console.debug(`[state-tracker activity] ${name} ${activity}`, payload)
//   //   logActivityPayload(payload)
//   // } else if (/end/i.test(activity)) {
//   //   // console.groupCollapsed()
//   //   console.debug(`[state-tracker activity] ${name} ${activity}`)
//   //   // payload && colorGroupCollapsed(colorLog(parts));
//   //   logActivityPayload(payload)
//   //   // payload && colorGroupEnd()
//   //   // colorGroupEnd()
//   // } else {
//   //   console.debug(`[state-tracker activity] ${name} ${activity}`)
//   //   // payload && colorGroupCollapsed(colorLog(parts));
//   //   logActivityPayload(payload)
//   //   // payload && colorGroupEnd()
//   // }

//   // if (!logActivityStackValue && pendingLog.length) {
//   //   console.log('length ================================= ', pendingLog.length)
//   //   pendingLog.forEach(log => {
//   //     const { fn, args} = log
//   //     fn.apply(null, args)
//   //   })
//   //   pendingLog = []
//   // }
// };

// const logActivityPayload = (payload?: { [key: string]: any }) => {
//   if (!payload) return;
//   if (isPlainObject(payload)) {
//     const keys = Object.keys(payload);
//     let maxLength = 0;
//     keys.forEach((key) => (maxLength = Math.max(maxLength, key.length)));

//     for (let idx = 0; idx < keys.length; idx++) {
//       const key = keys[idx];
//       let color = '#bfbfbf';
//       const fixedLengthKey = contentTitleFixedLength(key, maxLength + 1);
//       const style = `color: ${color}; font-weight: bold`;
//       const value = payload[key];
//       console.debug(fixedLengthKey, value);
//       // colorLine([...colorLog([[fixedLengthKey, style]]), value]);
//     }
//   }
// };

export { error, warn, infoChangedValue, logActivity };
