import React, { useEffect } from 'react'
// @ts-ignore
import { observe, useDispatch } from 'relinx'
import { Styles } from '../types'

import BottomBar from '../views/bottom-bar'
import GoodsView from '../views/goods-view'
import LoadMore from '../views/load-more'

const styles: Styles = {
  body: {
    width: '100%',
    height: '100%',
  },

  simulator: {
    paddingTop: 15,
    paddingBottom: 50,
    width: 375,
    height: 667,
    backgroundColor: '#fff',
    marginTop: 50,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 20,
    position: 'relative',
    border: '1px solid #000',
    boxSizing: 'border-box',
    display: 'flex',
  },
  goodsWrapper: {
    overflowY: 'auto',
    flex: 1,
  },
}

const Main = () => {
  const [dispatch] = useDispatch()

  useEffect(() => {
    dispatch([{
      type: 'init/updateOnline',
    }, {
      type: 'init/getGoodsList',
    }])

  }, [])

  return (
    <div style={styles.body}>
      <div style={styles.simulator}>
        <div style={styles.goodsWrapper}>
          <GoodsView />
          <LoadMore />
        </div>
        <BottomBar />
      </div>
    </div>
  )
}

export default observe(Main)