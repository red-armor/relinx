import React, { useCallback } from 'react'
import { observe, useDispatch } from 'relinx'
import { store } from '../index'

const styles = {
  wrapper: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    width: 100,
    height: 50,
    background: '#40a9ff',
    borderRadius: 5,
    border: 'none',
    cursor: 'pointer',
  }
}

const Helper = () => {
  const [dispatch] = useDispatch()

  const handleClick = useCallback(() => {
    const model = require('../models/goods').default
    store.injectModel('goods-v2', model())

    dispatch({
      type: 'goods-v2/incrementTotalCount',
    })
  }, [])

  return (
    <button
      onClick={handleClick}
      style={styles.wrapper}
    >
      Display
    </button>
  )
}

export default observe(Helper)