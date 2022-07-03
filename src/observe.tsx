import React, {
  useContext,
  useMemo,
  FC,
  useState,
  useRef,
  useEffect,
} from 'react';
import { warn, infoChangedValue } from './utils/logger';
import { bailBooleanValue } from './utils/commons';
import { ActivityToken, Reaction } from 'state-tracker';
import context from './context';
import { InjectedObserverProps } from './types';
import { logActivity } from './utils/logger';

const NODE_ENV = process.env.NODE_ENV;

const observeNext = <P extends {}>(
  WrappedComponent: FC<P>,
  options: {
    shallowEqual?: boolean;
    shouldLogActivity?: boolean;
    shouldLogRerender?: boolean;
    shouldLogChangedValue?: boolean;
  } = {}
) => {
  const {
    shouldLogActivity: componentShouldLogActivity,
    shouldLogRerender: componentShouldLogRerender,
    shouldLogChangedValue: componentShouldChangedValue,
    ...restOptions
  } = options;

  const componentName =
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'ObservedComponent';

  const MemoedComponent = React.memo(
    (props: any) => {
      const { v, isPropsEqual, ...rest } = props;

      // _$v should be passing, to fix WrappedComponent is a
      // MemoedComponent. If it is a MemoedComponent, MemoedComponent will not rerender
      // on state caused update.
      return <WrappedComponent _$v={v} {...rest} />;
    },
    (props, nextProps) => props.v === nextProps.v && nextProps.isPropsEqual
  );

  const EnterHelper = (props: any) => {
    const { reaction, shouldLogActivity } = props;
    if (shouldLogActivity) {
      logActivity({
        name: componentName,
        activity: 'trackDepsStart',
      });
    }
    reaction.enter();
    return null;
  };
  const LeaveHelper = (props: any) => {
    const { reaction, shouldLogActivity } = props;
    const stn = reaction.getStateTrackerNode();

    if (shouldLogActivity) {
      logActivity({
        name: componentName,
        activity: 'trackDepsEnd',
        payload: {
          stateGraphMap: stn.stateGraphMap,
          propsGraphMap: stn.propsGraphMap,
        },
      });
    }
    reaction.leave();
    return null;
  };

  const NextComponent: FC<Omit<P, keyof InjectedObserverProps> &
    InjectedObserverProps> = props => {
    const contextValue = useContext(context);
    const {
      store,
      shouldLogRerender,
      shouldLogActivity,
      shouldLogChangedValue,
    } = contextValue;
    const stateRef = useRef(0);
    const [v, setV] = useState(stateRef.current);
    const { $_modelKey, ...restProps } = props;
    const contextValueRef = useRef({ ...contextValue });
    const fn: any = useMemo(() => function() {}, []);
    const initialRef = useRef(true);

    // Should be default as `true` or reaction scheduler will not be trigger
    const mountedRef = useRef(true);

    const changedValueRef = useRef({});

    const changedValue = useMemo(() => {
      if (NODE_ENV === 'production') return;
      if (
        bailBooleanValue(componentShouldChangedValue, shouldLogChangedValue)
      ) {
        return changedValueRef.current;
      }
      return;
    }, [shouldLogChangedValue]);
    fn.displayName = componentName;

    const activityListener = useMemo(() => {
      if (NODE_ENV === 'production') return;
      const booleanValue = bailBooleanValue(
        componentShouldLogActivity,
        shouldLogActivity
      );
      if (booleanValue)
        return (activity: ActivityToken) => logActivity(activity);
      return;
    }, [componentShouldLogActivity, shouldLogActivity]);

    const reaction = useMemo(() => {
      return new Reaction({
        fn,
        state: store.getState(),
        scheduler: () => {
          // Even though, reaction.dispose is called on unmounted.
          // but, if component detect values change first. then current
          // forceUpdate may cause `memory leak` issue.
          if (initialRef.current || !mountedRef.current) return;
          setV(v => v + 1);
        },
        changedValue,
        activityListener,
        ...restOptions,
      });
    }, [store, fn]);

    let isPropsEqual = true;

    if (initialRef.current) {
      // props should be initialized first. or isPropsEqual will make error.
      reaction.initializeObserverProps(props);
      initialRef.current = false;
    } else {
      isPropsEqual = reaction.isPropsEqual(props);
    }

    useEffect(
      () => () => {
        mountedRef.current = false;
        reaction.dispose();
      },
      [reaction]
    );

    useEffect(() => {
      stateRef.current = v;
    }, [v, isPropsEqual]);

    if ($_modelKey) {
      contextValueRef.current.$_modelKey = $_modelKey;
    }

    const nextShouldLogRerender =
      typeof componentShouldLogRerender === 'boolean'
        ? componentShouldLogRerender
        : !!shouldLogRerender;

    const rerenderDueToPropsChanged = !isPropsEqual;
    const rerenderDueToStateChanged = stateRef.current !== v;

    if (changedValue) {
      if (rerenderDueToPropsChanged || rerenderDueToStateChanged) {
        changedValueRef.current = {};
        infoChangedValue(30001, componentName, changedValue);
      }
    }

    if (nextShouldLogRerender) {
      if (rerenderDueToStateChanged && !rerenderDueToPropsChanged) {
        warn(20009, componentName, 'state');
      }

      if (rerenderDueToPropsChanged && !rerenderDueToStateChanged) {
        warn(20009, componentName, 'props');
      }

      if (rerenderDueToPropsChanged && rerenderDueToStateChanged) {
        warn(20009, componentName, 'props && state');
      }
    }

    return (
      <context.Provider value={contextValueRef.current}>
        <EnterHelper
          reaction={reaction}
          shouldLogActivity={!!activityListener}
        />
        <MemoedComponent {...restProps} v={v} isPropsEqual={isPropsEqual} />
        <LeaveHelper
          reaction={reaction}
          shouldLogActivity={!!activityListener}
        />
      </context.Provider>
    );
  };

  return NextComponent;
};

export default observeNext;
