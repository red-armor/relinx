import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  // memo,
  FC,
} from 'react';
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
    const originRef = useRef();
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
        if (isObject(value) && typeof value.getTracker === 'function') {
          if (
            typeof originRef.current === 'undefined' ||
            originRef.current !== value
          ) {
            originRef.current = value;
            observablesRef.current[key] = value;
          } else {
            const pathTracker = value.getPathTracker();
            const paths = pathTracker.getPath();
            observablesRef.current[key] = application?.proxyState.peek(paths);
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

    application?.proxyState.enter(componentName);

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
      const paths = application?.proxyState
        .getContext()
        .getCurrent()
        .getRemarkable();

      patcher.current?.update({ paths: paths! });
      if (patcher.current) application?.addPatcher(patcher.current);
      patcherUpdated.current += 1;
      application?.proxyState.leave();
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
