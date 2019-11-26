import React from 'react'
import { useRelinx } from 'relinx'

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
}

export default () => {
  const [state] = useRelinx('BottomBar')
  console.log('render BottomBar')
  return (
    <div style={styles.wrapper}>
      <span style={styles.text}>
number
        {state.bottomBar.count}
      </span>
    </div>
  )
}
