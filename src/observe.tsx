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
const isObject = (o: any) => o ? (typeof o === 'object' || typeof o === 'function') : false // eslint-disable-line

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
    const patcherUpdated = useRef(0);
    const isMounted = useRef(false);
    const { $_modelKey, ...restProps } = props;
    const originRef = useRef(Object.create(null));
    const observablesRef = useRef(Object.create(null));

    const {
      application,
      useProxy,
      useScope,
      namespace,
      patcher: parentPatcher,
      useRelinkMode,
      ...rest
    } = useContext(context);

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
            originRef.current[key] = value;
            observablesRef.current[key] = value;
          } else {
            const pathTracker = StateTrackerUtil.getPathTracker(value);
            const paths = pathTracker.getPath();
            observablesRef.current[key] = StateTrackerUtil.peek(
              application!.proxyState,
              paths
            );
          }
        }
      }
    }

    const incrementCount = useRef(count++)  // eslint-disable-line
    const componentName = `${NextComponent.displayName}-${incrementCount.current}`;
    const patcher = useRef<undefined | Patcher>();

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

    StateTrackerUtil.enter(application!.proxyState, componentName);

    useEffect(
      () => () => {
        if (patcher.current) patcher.current.destroyPatcher();
      },
      [] // eslint-disable-line
    );

    const addListener = useCallback(() => {
      // take care, this may cause patcher teardown.
      patcher.current?.appendTo(parentPatcher); // maybe not needs

      // @ts-ignore
      const paths = StateTrackerUtil.getContext(application?.proxyState)
        .getCurrent()
        .getRemarkable();

      patcher.current?.update({ paths: paths! });
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
  }

  NextComponent.displayName =
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'ObservedComponent';

  return React.memo(props => <NextComponent {...props} />);
};
