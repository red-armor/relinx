import React, { CSSProperties, useRef } from 'react'
// @ts-ignore
import { useRelinx, observe } from '../../../src'
import GoodsItem from './GoodsItem'

const GoodsView = () => {
  const [state] = useRelinx('goods')
  const { listData } = state
  const updateCount = useRef(0)

  updateCount.current = updateCount.current + 1
  const spanStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '20px',
    color: 'red',
  }

  return (
    <div>
      <span style={spanStyle}>
        {`view update ${updateCount.current}`}
      </span>
      {listData.map((data, key) => (
        <GoodsItem
          key={key}
          data={data}
          index={key}
        />
      ))}
    </div>
  )
}

export default observe(GoodsView)