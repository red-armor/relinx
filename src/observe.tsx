import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  FC,
} from 'react';
import context from './context';
import Tracker from './tracker';
import { generatePatcherKey } from './utils/key';
import Patcher from './Patcher';
import infoLog from './utils/infoLog';
import { TrackerNode, PropProperty } from './tracker/types';
import { TRACKER } from './tracker/commons';

let count = 0;

const Helper = ({ addListener }: { addListener: Function }) => {
  addListener();
  return null;
};

export default (WrappedComponent: FC<any>) => {
  function NextComponent(props: any) {
    const shadowState = useRef(0);
    // @ts-ignore
    const [_, setState] = useState(0); // eslint-disable-line
    const storeName = useRef<string>();
    const isHydrated = useRef(false);
    const patcherUpdated = useRef(0);
    const isMounted = useRef(false);

    useEffect(() => {
      isMounted.current = true;
    });

    const {
      application,
      useProxy,
      useScope,
      namespace,
      patcher: parentPatcher,
      trackerNode: parentTrackerNode,
      useRelinkMode,
      ...rest
    } = useContext(context);

    const incrementCount = useRef(count++)  // eslint-disable-line
    const componentName = `${NextComponent.displayName}-${incrementCount.current}`;
    const patcher = useRef<undefined | Patcher>();
    const trackerNode = useRef<TrackerNode | null>(null);

    shadowState.current += 1;

    const autoRunFn = () => {
      if (isMounted.current) setState(state => state + 1);
    };

    if (!patcher.current) {
      patcher.current = new Patcher({
        paths: [],
        autoRunFn,
        parent: parentPatcher,
        key: generatePatcherKey({
          namespace: namespace as string,
          componentName,
        }),
        displayName: NextComponent.displayName,
      });
    }

    if (!trackerNode.current) {
      // `base` should has a default value value `{}`, or it will cause error.
      // Detail refer to https://github.com/ryuever/relinx/issues/6
      trackerNode.current = Tracker({
        base: {},
        useProxy,
        useRevoke: false,
        useScope,
        parent: parentTrackerNode,
        rootPath: [],
      });
    }

    if (trackerNode.current) {
      trackerNode.current.enterContext();
    }

    // destroy `patcher` when component un-mount.
    useEffect(
      () => () => {
        if (patcher.current) patcher.current.destroyPatcher();
      },
      [] // eslint-disable-line
    );

    const getData = useCallback(
      () => ({
        trackerNode: trackerNode.current || null,
      }),
      []
    );

    // onUpdate, `relink` relative paths value....
    if (trackerNode.current.proxy) {
      const proxy = trackerNode.current.proxy;
      const tracker = proxy[TRACKER];
      // 为什么如果进行remove的话，`propProperties`已经将旧key删除了呢。。。
      const propProperties: Array<PropProperty> = tracker.propProperties;

      propProperties.forEach(prop => {
        try {
          const { source } = prop;
          if (source) {
            const sourceTracker = source[TRACKER];
            const rootPath = sourceTracker.rootPath;
            const storeName = rootPath[0];
            const currentBase = application?.getStoreData(storeName);

            sourceTracker.relinkBase.call(source, currentBase);
          }
        } catch (err) {
          infoLog('[observe rebase propProperties]', err);
        }
      });

      if (useRelinkMode) {
        if (storeName.current) {
          const base = application?.getStoreData(storeName.current);
          tracker.rebase.call(proxy, base);
        }
      }

      tracker.cleanup.call(proxy);
    }

    // only run one time
    const attachStoreName = useCallback((name: string) => {
      if (useRelinkMode) {
        if (name && !isHydrated.current) {
          storeName.current = name;
          const initialState = application?.getStoreData(storeName.current);
          trackerNode.current?.hydrate(initialState, {
            rootPath: [storeName.current],
          });
          isHydrated.current = true;
        }
      } else {
        storeName.current = name;
        const initialState = application?.getStoreData(storeName.current);
        trackerNode.current?.hydrate(initialState, {
          rootPath: [storeName.current],
        });
        isHydrated.current = true;
      }
    }, []); // eslint-disable-line

    const addListener = useCallback(() => {
      patcher.current?.appendTo(parentPatcher); // maybe not needs
      if (!trackerNode.current?.proxy) {
        if (trackerNode.current) trackerNode.current.leaveContext();
        return;
      }

      const proxy = trackerNode.current.proxy;
      const proxyTracker = proxy[TRACKER];
      const paths = proxyTracker.getRemarkableFullPaths.call(proxy);

      // const paths = trackerNode.current.proxy.runFn('getRemarkableFullPaths');
      patcher.current?.update({ paths });
      if (patcher.current) application?.addPatcher(patcher.current);
      patcherUpdated.current += 1;
      trackerNode.current.leaveContext();
    }, []); // eslint-disable-line

    const contextValue = {
      ...rest,
      getData,
      application,
      useProxy,
      useScope,
      namespace,
      useRelinkMode,
      patcher: patcher.current,
      trackerNode: trackerNode.current || null,
      attachStoreName,
    };

    return (
      <context.Provider value={contextValue}>
        <React.Fragment>
          <WrappedComponent {...props} />
          <Helper addListener={addListener} />
        </React.Fragment>
      </context.Provider>
    );
  }

  NextComponent.displayName =
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'ObservedComponent';

  return NextComponent;
  // return React.memo(props => <NextComponent {...props} />, () => true)
};
