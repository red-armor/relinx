import React, { useRef } from 'react'
import { useRelinx, observe } from '../../../src/index'
import GoodsItem from '../components/GoodsItem'

const spanStyle ={
  position: 'absolute',
  top: 0,
  left: '20px',
  color: 'red',
}

const GoodsView = () => {
  const [state] = useRelinx('goods')
  const { listData = [], bottomBarUpdateCount, listLength } = state

  return (
    <div>
      <span style={spanStyle}>
        {`bottomBarUpdate ${bottomBarUpdateCount}, length ${listLength}`}
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