import React, {
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react'

import Computation from './tracker/Computation'
import context from './context'
import central from './tracker/central'
import infoLog from './utils/infoLog'

const DEBUG = false
let pathNumber = 0

export default WrappedComponent => props => {
  const {
    computation: beforeComputation,
    pathNumber: pn,
    ...rest
  } = useContext(context)

  const [state, setState] = useState(0)
  const autoRunUpdated = useRef(false)
  const parentPathNumber = pn || pathNumber
  const currentPathNumber = ++pathNumber // eslint-disable-line
  const newPathNumber = `${parentPathNumber}.${currentPathNumber}`

  const componentName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'ObservedComponent'

  if (beforeComputation && beforeComputation.autoRunUpdated && !autoRunUpdated.current) {
    autoRunUpdated.current = true
  }

  const newComputation = new Computation({
    autoRun: () => {
      setState(state + 1)

      if (DEBUG) {
        infoLog(`\`${componentName}\` component updated`)
      }

      autoRunUpdated.current = true
    },
    pathNumber: newPathNumber,
    // imitate `beforeSelection` in `draft.js`; every component will remember
    // the computation it replace. once current computation finished, the
    // current computation context will be handle to `beforeComponent`
    // beforeComputation: currentComputation,
    name: componentName,
    autoRunUpdated: autoRunUpdated.current,
  })
  central.setCurrentComputation(newComputation)

  /* ------------------------------------------------------------------
   * const A = observe(() => {
   *   return (
   *     <B>
   *       <C />
   *       <D />
   *     </B>
   *   )
   * })
   *
   * The parse of DOM Component and Composite Component is under sync mode.
   * path register will be triggered during jsx parsed.
   * `onEffect` will be triggered after jsx parsed. You cant get a component
   * fully parsed directly. Here, using `ResetComputationHelper` to do this
   * hack.
   * -------------------------------------------------------------------
  */
  const ResetComputationHelper = () => {
    central.flush()
    central.resetCurrentComputation(beforeComputation)

    if (autoRunUpdated.current) {
      autoRunUpdated.current = false
    }
    return null
  }

  // 如果这一层不做约束的话，当`parent`更新的时候，它的所有子组件都会进行刷新；
  // 一旦引入状态管理，最好的方式就是不再存在父类联动子类，子类是通过绑定来联动的
  // const MemoWrapped = memo(() =>
  // // return React.cloneElement(WrappedComponent, {...props})
  //   <WrappedComponent {...props} />,
  // (prev, next) => shallowEqual(prev, next))

  // When it comes to `unmount`, computation's listener should be clear.
  // Note that use `unsub.current` to get the latest created computation
  useEffect(() => () => { newComputation.clear() })

  central.flush()

  useEffect(() => {
    central.flush()
  })

  return (
    <context.Provider
      value={{
        ...rest,
        pathNumber: newPathNumber,
        computation: newComputation,
      }}
    >
      <React.Fragment>
        {/* <MemoWrapped /> */}
        <WrappedComponent {...props} />
        <ResetComputationHelper />
      </React.Fragment>
    </context.Provider>
  )
}
