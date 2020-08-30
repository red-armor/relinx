import toString from './toString';

export const isPresent = (o: any) => typeof o !== 'undefined';
export const isObject = (obj: any) => toString(obj) === '[object Object]';
export const isArray = (obj: any) => toString(obj) === '[object Array]';

export const isMutable = (obj: any) => isObject(obj) || isArray(obj);
export const isTypeEqual = (o1: any, o2: any) => toString(o1) === toString(o2);

export const isStrictEmptyObject = (obj: any) => {
  if (!isObject(obj)) return false;

  for (const prop in obj) { // eslint-disable-line
    if (obj.hasOwnProperty(prop)) return false // eslint-disable-line
  }
  return true;
};

export const isStrictEmptyArray = (arr: any) => isArray(arr) && !arr.length;

export const hasEmptyItem = (...args: Array<any>) =>
  args.some(arg => isStrictEmptyArray(arg) || isStrictEmptyObject(arg));
