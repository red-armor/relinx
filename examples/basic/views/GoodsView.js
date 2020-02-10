import React from 'react'
import { useRelinx, observe } from 'relinx'
import GoodsItem from '../components/GoodsItem'

const GoodsView = () => {
  const [state] = useRelinx('goods')
  const { listData } = state

  console.log('state ', state)

  return listData.map((data, key) => (
    <GoodsItem
      key={key}
      data={data}
      index={key}
    />
  ))
}

export default observe(GoodsView)