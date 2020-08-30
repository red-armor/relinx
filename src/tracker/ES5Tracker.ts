import internalFunctions from './internalFunctions';
import { inherit, Type, createHiddenProperty } from './commons';
import {
  ES5TrackerConstructorProps,
  ES5TrackerConstructor,
  IES5Tracker,
} from './types';

let count = 0;

const ES5Tracker = (function(
  this: ES5TrackerConstructor,
  {
    accessPath,
    parentProxy,
    rootPath,
    base,
    trackerNode,
    useRevoke,
    useScope,
  }: ES5TrackerConstructorProps
) {
  createHiddenProperty(this, 'id', `ES5Tracker_${count++}`) // eslint-disable-line

  createHiddenProperty(this, 'trackerNode', trackerNode);
  createHiddenProperty(this, 'accessPath', accessPath);
  createHiddenProperty(this, 'rootPath', rootPath);
  createHiddenProperty(
    this,
    'type',
    Array.isArray(base) ? Type.Array : Type.Object
  );
  createHiddenProperty(this, 'base', base);

  createHiddenProperty(this, 'parentProxy', parentProxy);
  createHiddenProperty(this, 'childProxies', {});

  createHiddenProperty(this, 'isPeeking', false);
  createHiddenProperty(this, 'propProperties', []);
  createHiddenProperty(this, 'paths', []);

  createHiddenProperty(this, 'useRevoke', useRevoke);
  createHiddenProperty(this, 'useScope', useScope);

  createHiddenProperty(this, 'isRevoked', false);
  createHiddenProperty(this, 'assertRevoke', function(this: IES5Tracker) {
    const useRevoke = this.getProp('useRevoke');
    if (!useRevoke) return;
    const isRevoked = this.getProp('isRevoked');
    if (isRevoked) {
      throw new Error(
        'Cannot use a proxy that has been revoked. Did you pass an object ' +
          'to an async process? '
      );
    }
  });
} as any) as ES5TrackerConstructor;

inherit(ES5Tracker, internalFunctions);

export default ES5Tracker;
