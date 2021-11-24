// https://github.com/facebook/draft-js/blob/master/src/model/keys/generateRandomKey.js

interface SeenKeys {
  [key: string]: boolean;
}

interface PatcherIds {
  [key: string]: number;
}

interface PatcherSeenKeys {
  [key: string]: {
    [key: string]: number;
  };
}

const seenKeys: SeenKeys = {};
const MULTIPLIER = Math.pow(2, 24); // eslint-disable-line

export const generateNamespaceKey = () => {
  let key;

  while (key === undefined || seenKeys.hasOwnProperty(key) || !isNaN(+key)) {
    // eslint-disable-line
    key = Math.floor(Math.random() * MULTIPLIER).toString(32);
  }

  seenKeys[key] = true;
  return key;
};

const patcherIds: PatcherIds = {};
export const generatePatcherId = ({
  namespace,
}: {
  namespace: string;
}): string => {
  const count = patcherIds[namespace] || 0;
  const next = count + 1;
  patcherIds[namespace] = next;
  return `${namespace}_patcherId_${count}`;
};

const patcherSeenKeys: PatcherSeenKeys = {};
export const generatePatcherKey = ({
  namespace,
  componentName,
}: {
  namespace: string;
  componentName: string;
}) => {
  if (!patcherSeenKeys[namespace]) patcherSeenKeys[namespace] = {};
  const count = patcherSeenKeys[namespace][componentName] || 0;
  const next = count + 1;
  patcherSeenKeys[namespace][componentName] = next;
  return `${namespace}_${componentName}_patcher_${count}`;
};

export const generateRandomGlobalActionKey = () =>
  Math.floor(Math.random() * MULTIPLIER).toString(32); // eslint-disable-line
