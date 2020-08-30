const toString = Function.call.bind<Function>(Object.prototype.toString);
const ownKeys = (o: any) =>
  typeof Reflect !== 'undefined' && Reflect.ownKeys
    ? Reflect.ownKeys(o)
    : typeof Object.getOwnPropertySymbols !== 'undefined'
    ? Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o))
    : Object.getOwnPropertyNames(o);

export const emptyFunction = () => {};
export const isObject = (o: any) => o ? (typeof o === 'object' || typeof o === 'function') : false // eslint-disable-line
export const hasSymbol = typeof Symbol !== 'undefined';
export const TRACKER: unique symbol = hasSymbol
  ? Symbol('tracker')
  : ('__tracker__' as any);

export const canIUseProxy = () => {
  try {
    new Proxy({}, {}) // eslint-disable-line
  } catch (err) {
    return false;
  }

  return true;
};

export const hasOwnProperty = (o, prop) => o.hasOwnProperty(prop) // eslint-disable-line

export const isTrackable = (o: any) => { // eslint-disable-line
  return ['[object Object]', '[object Array]'].indexOf(toString(o)) !== -1;
};

export function each(obj: Array<any> | object, iter: Function) {
  if (Array.isArray(obj)) {
    obj.forEach((entry, index) => iter(index, entry, obj));
  } else if (isObject(obj)) {
    ownKeys(obj).forEach(key => iter(key, obj[key], obj));
  }
}

export const Type = {
  Object: 'object',
  Array: 'array',
};

export function shallowCopy(o: any) {
  if (Array.isArray(o)) return o.slice();
  const value = Object.create(Object.getPrototypeOf(o));
  ownKeys(o).forEach(key => {
    value[key] = o[key];
  });

  return value;
}

export const inherit = (
  subClass: {
    prototype: any;
    // __proto__: any;
  },
  superClass: {
    prototype: any;
  }
) => {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  // subClass.__proto__ = superClass // eslint-disable-line
};

export const createHiddenProperty = (
  target: object,
  prop: PropertyKey,
  value: any
) => {
  Object.defineProperty(target, prop, {
    value,
    enumerable: false,
    writable: true,
  });
};

export const hideProperty = (target: object, prop: PropertyKey) => {
  Object.defineProperty(target, prop, {
    enumerable: false,
    configurable: false,
  });
};
