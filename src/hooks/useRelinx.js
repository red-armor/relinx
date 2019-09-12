import { useContext, useEffect, useState, useMemo } from 'react'
import context from '../context'
import useReactiveState from '../reactive-state/useReactiveState'
// import useForceUpdate from './useForceUpdate'

export default () => {
  const { value, dispatch } = useContext(context)
  const state = useMemo(() => useReactiveState(value), [])
  const [data, setValue] = useState(0)

  useEffect(() => {
    const { unsubscribe } = state.subscribe(() => {
      // useForceUpdate()
      setValue(Math.floor(Math.random() * 100) + 1  )
    })

    return unsubscribe
  }, [data])

  return [state, dispatch]
}