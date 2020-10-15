import React, { useRef } from 'react'
import { useRelinx, observe } from 'relinx'
import GoodsItem from '../components/GoodsItem'

const GoodsView = () => {
  const [state] = useRelinx('goods')
  const { listData, bottomBarUpdateCount, listLength } = state

  const updateCount = useRef(0)

  updateCount.current = updateCount.current + 1
  const spanStyle = useRef({
    position: 'absolute',
    top: 0,
    left: '20px',
    color: 'red',
  })

  return (
    <div>
      <span style={spanStyle.current}>
        {`view update ${updateCount.current}, bottomBarUpdate ${bottomBarUpdateCount}, length ${listLength}`}
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