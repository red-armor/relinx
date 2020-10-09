import React from 'react'
import { observe } from '../../../src/index'

import BottomBar from './BottomBar'
import GoodsView from './GoodsView'
import LoadMore from './LoadMore'

const styles = {
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