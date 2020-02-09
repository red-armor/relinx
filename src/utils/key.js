// https://github.com/facebook/draft-js/blob/master/src/model/keys/generateRandomKey.js

const seenKeys = {};
const MULTIPLIER = Math.pow(2, 24);

export const generateNamespaceKey = () => {
  let key

  while (key === undefined || seenKeys.hasOwnProperty(key) || !isNaN(+key)) {
    key = Math.floor(Math.random() * MULTIPLIER).toString(32);
  }

  seenKeys[key] = true
  return key
}

const patcherIds = {}
export const generatePatcherId = ({ namespace }) => {
  const count = patcherIds[namespace] || 0
  const next = count + 1
  patcherIds[namespace] = next
  return `${namespace}_patcherId_${count}`
}

const patcherSeenKeys = {}
export const generatePatcherKey = ({ namespace, componentName }) => {
  if (!patcherSeenKeys[namespace]) patcherSeenKeys[namespace] = {}
  const count = patcherSeenKeys[namespace][componentName] || 0
  const next = count + 1
  patcherSeenKeys[namespace][componentName] = next
  return `${namespace}_${componentName}_patcher_${count}`
}