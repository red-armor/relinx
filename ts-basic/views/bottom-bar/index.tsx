import React from 'react'
// @ts-ignore
import { useRelinx, observe, useGlobal, useNamespace } from '../../../src'
import { Styles } from '../../types'

const styles: Styles = {
  wrapper: {
    right: 0,
    bottom: 0,
    left: 0,
    height: 50,
    position: 'absolute',
    backgroundColor: '#fff',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderTop: '1px solid #eee',
  },
  text: {
    fontSize: 16,
    lineHeight: '20px',
    marginTop: 15,
    paddingLeft: 15,
    color: 'rgb(230, 48, 48)',
    position: 'relative',
    display: 'block',
  },
}

const BottomBar = () => {
  const [state] = useRelinx('bottomBar')
  const value = useGlobal()
  const namespace = useNamespace()

  const [collections, globalDispatch] = useGlobal()
  const group = collections.filter(collection => {
    const { namespace: targetNamespace } = collection
    return targetNamespace === namespace
  })

  globalDispatch([{
    namespace: 'address-list',
    actions: [{
      type: 'addressList/setSelectedId',
      payload: 'x',
    }],
  }])

  const { count } = state

  return (
    <div style={styles.wrapper}>
      <span style={styles.text}>
        {`number ${count}`}
      </span>
    </div>
  )
}

export default observe(BottomBar)