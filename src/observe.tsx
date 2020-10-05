import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  FC,
} from 'react';
import context from './context';
import { generatePatcherKey } from './utils/key';
import Patcher from './Patcher';
import { TrackerNode } from './tracker/types';

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

    application?.proxyState.enter()

    useEffect(
      () => () => {
        if (patcher.current) patcher.current.destroyPatcher();
      },
      [] // eslint-disable-line
    );

    const addListener = useCallback(() => {
      patcher.current?.appendTo(parentPatcher); // maybe not needs
      const paths = application?.proxyState.getContext().getCurrent().getRemarkable()
      patcher.current?.update({ paths });
      if (patcher.current) application?.addPatcher(patcher.current);
      patcherUpdated.current += 1;
      application?.proxyState.leave()
    }, []); // eslint-disable-line

    const contextValue = {
      ...rest,
      application,
      useProxy,
      useScope,
      namespace,
      useRelinkMode,
      patcher: patcher.current,
      trackerNode: trackerNode.current || null,
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
