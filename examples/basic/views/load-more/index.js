import React, { useCallback } from 'react'
import { observe, useDispatch } from 'relinx'

const styles = {
  wrapper: {
    width: '100%',
    height: 50,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: '50px',
    backgroundColor: '#5cbd3c',
  },
}

const LoadMore = () => {
  const [dispatch] = useDispatch()
  const handleClick = useCallback(() => {
    dispatch({
      type: 'init/getGoodsList',
    })
  }, [])

  return (
    <div style={styles.wrapper} onClick={handleClick}>
      获取更多
    </div>
  )
}

export default observe(LoadMore)
