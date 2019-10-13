import React from 'react'
import { useRelinx } from 'relinx'
import GoodsItem from '../components/GoodsItem'

export default () => {
  const [state] = useRelinx('GoodsView')
  const { goods: { listData } } = state

  console.log('render GoodsView')

  return listData.getUnTrack().map((data, key) => (
    <GoodsItem
      key={key}
      data={data}
      index={key}
    />
  ))
}