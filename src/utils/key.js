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

export const generateConnectKey = ({ namespace, componentName }) => {

}

export const generatePatcherKey = ({ namespace, componentName }) => {

}