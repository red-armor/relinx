import React from 'react'
import { useRelinx } from 'relinx'
import GoodsItem from '../components/GoodsItem'

export default () => {
  const [state] = useRelinx()
  const { goods: { listData } } = state

  return listData.map((data, key) => (
    <GoodsItem
      key={key}
      data={data}
    />
  ))
}