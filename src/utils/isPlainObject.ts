// https://github.com/immerjs/immer/blob/master/src/common.ts#L53

export default function isPlainObject(value: any) {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return true;
  const proto = Object.getPrototypeOf(value);
  return !proto || proto === Object.prototype;
}
