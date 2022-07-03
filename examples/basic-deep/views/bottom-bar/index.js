import React, { useCallback } from 'react'
import { useRelinx, observe } from 'relinx'

const styles = {
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

  btn: {
    position: 'absolute',
    background: '#34f332',
    right: 20,
    top: 0,
    height: 50,
    border: 'none',
  }
}

const BottomBar = () => {
  const [state, dispatch] = useRelinx('bottomBar')
  const { count, currentItem } = state

  const onClick = useCallback(() => {
    dispatch({
      type: 'goods/swap'
    })
  }, [])

  return (
    <div style={styles.wrapper}>
      <span style={styles.text}>
        {`number ${count} ${currentItem ? currentItem.meta.title : ''}`}
      </span>

      <button style={styles.btn} onClick={onClick}>swap 1,3</button>
    </div>
  )
}

export default observe(BottomBar)