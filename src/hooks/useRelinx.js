import { useContext, useEffect, useRef } from 'react'
import invariant from 'invariant'
import context from '../context'

export default storeName => {
  const {
    dispatch,
    getData,
    attachStoreName,
    // occupied,
  } = useContext(context)

  // const verifyOccupy = useRef(false)

  // if (!verifyOccupy.current) {
  //   const { occupied } = getData()
  //   console.log('occ ', occupied)
  //   if (occupied) throw new Error('missing observe')
  // }

  // useEffect(() => {
  //   verifyOccupy.current = true
  // }, [])

  invariant(
    typeof storeName === 'string' && storeName !== '',
    '`storeName` is required'
  )

  attachStoreName(storeName)

  const { trackerNode } = getData()

  return [trackerNode.proxy, dispatch]
}
