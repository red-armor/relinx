export const isDEV = process.env.NODE_ENV !== 'production';

export const bailBooleanValue = (
  ...args: Array<Boolean | null | undefined>
) => {
  const len = args.length;
  for (let idx = 0; idx < len; idx++) {
    const value = args[idx];
    if (typeof value === 'boolean') return value;
  }
  return false;
};
