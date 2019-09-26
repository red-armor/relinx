import React, { useCallback } from 'react'
import { useRelinx } from 'relinx'

const styles = {
  wrapper: {
    width: '100%',
    height: 50,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: '50px',
    backgroundColor: '#5cbd3c',
  }
}

export default () => {
  const [_, dispatch] = useRelinx()
  const handleClick = useCallback(() => {
    dispatch({
      type: 'init/getGoodsList',
    })
  }, [])

  console.log('render LoadMore')

  return (
    <div style={styles.wrapper} onClick={handleClick}>
      获取更多
    </div>
  )
}