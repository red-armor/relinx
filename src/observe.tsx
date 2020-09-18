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

let count = 0;

const Helper = ({ addListener }: { addListener: Function }) => {
  addListener();
  return null;
};

const DEBUG = false;

const unMountMap: {
  [key: string]: undefined | Patcher;
} = {};
const reRenderMap: {
  [key: string]: undefined | Patcher;
} = {};

const diff = (
  componentName: string,
  patcher: undefined | Patcher,
  proxy: undefined | TrackerNode
) => {
  const key1 = Object.keys(unMountMap);
  if (key1.indexOf(componentName) !== -1) {
    infoLog('invalid re-render', componentName, patcher, proxy);
  }
};

export default (WrappedComponent: FC<any>) => {
  function NextComponent(props: any) {
    const shadowState = useRef(0);
    // @ts-ignore
    const [_, setState] = useState(0); // eslint-disable-line
    const storeName = useRef<string>();
    const isHydrated = useRef(false);
    const isInit = useRef(true);
    const patcherUpdated = useRef(0);

    const {
      application,
      useProxy,
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
      setState(state => state + 1);
      reRenderMap[componentName] = patcher.current;
      diff(componentName, patcher.current, trackerNode.current!);
    };

    useEffect(() => {
      if (!DEBUG) return;
      if (isInit.current) {
        infoLog('[Observe]', `${componentName} is init`);
        isInit.current = false;
      } else {
        infoLog('[Observe]', `${componentName} is re-rendered`);
      }
    });

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
        useScope: true,
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
        unMountMap[componentName] = patcher.current;
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
      // 为什么如果进行remove的话，`propProperties`已经将旧key删除了呢。。。
      const propProperties: Array<PropProperty> = proxy.getProp(
        'propProperties'
      );

      propProperties.forEach(prop => {
        try {
          const { source } = prop;
          const rootPath = source?.getProp('rootPath');
          const storeName = rootPath[0];
          const currentBase = application?.getStoreData(storeName);
          source?.runFn('relinkBase', currentBase);
        } catch (err) {
          infoLog('[observe rebase propProperties]', err);
        }
      });

      if (useRelinkMode) {
        if (storeName.current) {
          const base = application?.getStoreData(storeName.current);
          proxy.runFn('rebase', base);
        }
      }

      trackerNode.current.proxy.runFn('cleanup');
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
      if (!trackerNode.current?.proxy) return;

      const paths = trackerNode.current.proxy.runFn('getRemarkableFullPaths');
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
