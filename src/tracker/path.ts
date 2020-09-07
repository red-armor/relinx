const joinPath = (path: Array<string>) => path.join('_');

interface AccessMap {
  [key: string]: number;
}

export const generateRemarkablePaths = (paths: Array<Array<string>>) => {
  const copy = paths.slice();
  const accessMap: AccessMap = {};
  const len = copy.length;
  const remarkablePaths = [];

  for (let i = len - 1; i >= 0; i--) {
    const path = copy[i].slice();
    const pathLength = path.length;

    let isConsecutive = false;

    for (let i = 0; i < pathLength; i++) {
      const joinedPath = joinPath(path);
      const count = accessMap[joinedPath] || 0;

      // the intermediate accessed path will be ignored.
      // https://stackoverflow.com/questions/2937120/how-to-get-javascript-object-references-or-reference-count
      // because of this, intermediate value may be ignored...
      if (isConsecutive) {
        accessMap[joinedPath] = count + 1;
        path.pop();
        continue // eslint-disable-line
      }

      if (!count) {
        const p = path.slice();
        const str = joinPath(p);
        const found = remarkablePaths.find(path => joinPath(path) === str);
        if (!found) remarkablePaths.push(p);
        isConsecutive = true;
        path.pop();
      } else {
        accessMap[joinedPath] = count - 1;
        break;
      }
    }
  }

  return remarkablePaths;
};
