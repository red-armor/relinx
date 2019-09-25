import React, { useCallback } from 'react'
import { useRelinx } from 'relinx'

const styles = {
  container: {
    height: 50,
    padding: 15,
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    position: 'relative',
  },
  title: {
    fontSize: 16,
    lineHeight: '20px',
    color: 'rgb(23, 171, 37)',
  },
  counter: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 90,
    bottom: 0,
  },
  addon: {
    fontSize: 16,
    lineHeight: '20px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    marginTop: '10px',
    outline: 0,
  },
  itemCount: {
    marginLeft: 5,
    marginRight: 5,
    fontSize: 16,
    width: 15,
    display: 'inline-block',
    textAlign: 'center',
  }
}

export default props => {
  const [state, dispatch] = useRelinx(`GoodsItem_${index}`)
  const { data: { title, id }, index } = props
  const count = state.goods.itemCount[id] || 0

  const increment = useCallback(() => {
    dispatch({
      type: 'goods/increment',
      payload: { id }
    })
  }, [])

  const decrement = useCallback(() => {
    dispatch({
      type: 'goods/decrement',
      payload: { id }
    })
  }, [])

  return (
    <div style={styles.container}>
      <span style={styles.title}>{title}</span>
      <div style={styles.counter}>
        <button style={styles.addon} onClick={increment}>+</button>
        <span style={styles.itemCount}>{count}</span>
        <button style={styles.addon} onClick={decrement}>-</button>
      </div>
    </div>
  )
}