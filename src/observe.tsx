import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  FC,
} from 'react';
import { StateTrackerUtil } from 'state-tracker';
import context from './context';
import { generatePatcherKey } from './utils/key';
import Patcher from './Patcher';
import { UPDATE_TYPE, InjectedObserverProps } from './types';
import { loggerWhy } from './utils/logger';

const isObject = (o: any) => o ? (typeof o === 'object' || typeof o === 'function') : false // eslint-disable-line

let count = 0;
const NODE_ENV = process.env.NODE_ENV;

const Helper = ({ addListener }: { addListener: Function }) => {
  addListener();
  return null;
};

// https://medium.com/@jrwebdev/react-higher-order-component-patterns-in-typescript-42278f7590fb
const observe = <P extends {}>(WrappedComponent: FC<P>) => {
  const NextComponent = (
    props: Omit<P, keyof InjectedObserverProps> & InjectedObserverProps
  ) => {
    const shadowState = useRef(0);
    // @ts-ignore
    const [_, setState] = useState(0); // eslint-disable-line
    const patcherUpdated = useRef(0);

    // default as true, it will cause collection fail when component is dynamic
    // injected. use case: ProfitBanner in goodsDetail
    // After mount component, then trigger autoRun, `isMounted` is false actually.
    const isMounted = useRef(true);
    const { $_modelKey, ...restProps } = props;
    const originRef = useRef(Object.create(null));
    const observablesRef = useRef(Object.create(null));

    const {
      useProxy,
      useScope,
      namespace,
      application,
      useRelinkMode,
      patcher: parentPatcher,
      ...rest
    } = useContext(context);
    const patcher = useRef<undefined | Patcher>();

    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

    for (let key in restProps) {
      if (restProps.hasOwnProperty(key)) {
        const value = (restProps as any)[key];

        if (isObject(value) && StateTrackerUtil.hasTracker(value)) {
          if (
            typeof originRef.current[key] === 'undefined' ||
            originRef.current[key] !== value
          ) {
            // update is triggered by parent
            originRef.current[key] = value;
            observablesRef.current[key] = value;
          } else {
            // update is triggered by itself
            const pathTracker = StateTrackerUtil.getPathTracker(value);
            const paths = pathTracker.getPath();
            const first = application?.store.getModelKey(paths[0])!;
            const nextPaths = ([] as Array<string>).concat(
              first,
              paths.slice(1)
            );

            const nextValue = StateTrackerUtil.peek(
              application!.proxyState,
              nextPaths
            );

            if (nextValue !== observablesRef.current[key]) {
              observablesRef.current[key] = nextValue;
            }
          }
        }
      }
    }

    // for (let key in restProps) {
    //   if (restProps.hasOwnProperty(key)) {
    //     const value = (restProps as any)[key];
    //     if (isObject(value) && StateTrackerUtil.hasTracker(value)) {
    //       if (typeof originRef.current[key] === 'undefined') {
    //         originRef.current[key] = value;
    //         observablesRef.current[key] = value;
    //       } else if (originRef.current[key] === value) {
    //         const pathTracker = StateTrackerUtil.getPathTracker(value)
    //         const paths = pathTracker.getPath();
    //         observablesRef.current[key] = StateTrackerUtil.peek(
    //           application!.proxyState,
    //           paths
    //         );
    //       } else {
    //         const originRefTracker = StateTrackerUtil.getTracker(originRef.current[key] as any)
    //         const observableTracker = StateTrackerUtil.getTracker(value)

    //         if (originRefTracker._base !== observableTracker._base) {
    //           const pathTracker = StateTrackerUtil.getPathTracker(value)
    //           const paths = pathTracker.getPath();
    //           observablesRef.current[key] = StateTrackerUtil.peek(
    //             application!.proxyState,
    //             paths
    //           );
    //         }
    //       }
    //     }
    //   }
    // }

    const incrementCount = useRef(count++)  // eslint-disable-line
    const componentName = `${NextComponent.displayName}-${incrementCount.current}`;

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

    // !!! enter must followed by an leave, or may cause path collection issue.
    StateTrackerUtil.enter(application!.proxyState, componentName);

    useEffect(
      () => () => {
        if (patcher.current) patcher.current.destroyPatcher();
      },
      [] // eslint-disable-line
    );

    const addListener = useCallback(() => {
      // @ts-ignore
      const paths = StateTrackerUtil.getContext(application?.proxyState)
        .getCurrent()
        .getRemarkable();
      patcher.current?.appendTo(parentPatcher); // maybe not needs
      if (
        application?.getUpdateType() === UPDATE_TYPE.ARRAY_LENGTH_CHANGE &&
        !paths.length
      ) {
        // !!! leave must follow an enter. or it may cause path collection error
        StateTrackerUtil.leave(application!.proxyState);
        return;
      }
      patcher.current?.update({ paths: paths! });
      // take care, this may cause patcher teardown.
      if (patcher.current) application?.addPatcher(patcher.current);
      patcherUpdated.current += 1;
      StateTrackerUtil.leave(application!.proxyState);
    }, []); // eslint-disable-line

    const contextValue = {
      ...rest,
      application,
      useProxy,
      useScope,
      namespace,
      useRelinkMode,
      patcher: patcher.current,
      componentName: componentName,
    };

    if ($_modelKey) {
      contextValue.$_modelKey = $_modelKey;
    }

    return (
      <context.Provider value={contextValue}>
        <React.Fragment>
          <WrappedComponent {...restProps} {...observablesRef.current} />
          <Helper addListener={addListener} />
        </React.Fragment>
      </context.Provider>
    );
  };

  NextComponent.displayName =
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'ObservedComponent';

  const Next = (props: Omit<P, keyof InjectedObserverProps>) => (
    <NextComponent {...props} />
  );

  Next.displayName = NextComponent.displayName;

  const dependency = (prevProps: any, nextProps: any) => {
    const keys = Object.keys(prevProps);
    let falsy = true;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (prevProps[key] !== nextProps[key]) {
        if (loggerWhy.getCurrent() && NODE_ENV === 'development') {
          console.groupCollapsed(
            `%c[relinx, why did you update ${NextComponent.displayName} component]`,
            'color: #b37feb'
          );
          console.group(`%cupdated key '${key}'`, 'color: #95de64');
          console.log(
            '%cprev value',
            'color: #ff4d4f; font-weight: bold',
            prevProps[key]
          );
          console.log(
            '%cnext value',
            'color: #ff4d4f; font-weight: bold',
            nextProps[key]
          );
          console.groupEnd();
          console.groupEnd();
        }
        return false;
      }
    }

    return falsy;
  };

  return React.memo(Next, dependency);
};

export default observe;
