import React, { useCallback, useRef } from 'react'
import { useDispatch, observe, useRelinx } from 'relinx'

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
  },
}

const GoodsItem = props => {
  const [dispatch] = useDispatch()
  const { data: { title, id, count } } = props
  const updateCount = useRef(0)

  const spanStyle = useRef({
    color: 'grey',
    marginLeft: '20px',
  })

  updateCount.current = updateCount.current + 1

  const increment = useCallback(() => {
    dispatch({
      type: 'goods/increment',
      payload: { id },
    })
  }, [])

  const decrement = useCallback(() => {
    dispatch({
      type: 'goods/decrement',
      payload: { id },
    })
  }, [])

  return (
    <div style={styles.container}>

      <span style={styles.title}>{title}</span>

      <span style={spanStyle.current}>
        {`(item update ${updateCount.current})`}
      </span>

      <div style={styles.counter}>
        <button style={styles.addon} onClick={increment}>+</button>
        <span style={styles.itemCount}>{count}</span>
        <button style={styles.addon} onClick={decrement}>-</button>
      </div>
    </div>
  )
}

export default observe(React.memo(props => <GoodsItem {...props} />))
