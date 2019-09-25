import { useContext, useState } from 'react'
import context from '../context'

import useTracker from '../reactive-state/useTracker'

export default name => {
  const { dispatch } = useContext(context)
  const [value, setValue] = useState(0)

  const state = useTracker(() => {
    setValue(value + 1)
  }, name)

  return [state, dispatch]
}