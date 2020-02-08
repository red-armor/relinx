import { useContext } from 'react'
import invariant from 'invariant'
import context from '../context'

export default storeName => {
  const {
    dispatch,
    getData,
    attachStoreName,
  } = useContext(context)

  invariant(
    typeof storeName === 'string' && storeName !== '',
    '`storeName` is required'
  )
  attachStoreName(storeName)

  const { trackerNode } = getData()

  return [trackerNode.tracker, dispatch]
}
