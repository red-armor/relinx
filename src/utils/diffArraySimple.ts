function diffArraySimple(
  a: Array<string> = [] as any,
  b: Array<string>
): Array<string> {
  const parts: Array<string> = [];

  for (let i = 0; i < a.length; i++) {
    const key = a[i];
    if (b.indexOf(key) === -1) {
      parts.push(key);
    }
  }

  return parts;
}

export default diffArraySimple;
