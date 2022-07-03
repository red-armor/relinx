import React from 'react'
import GoodsItem from "./GoodsItem";
import { useRelinx, observe } from 'relinx'

const CurrentItemV2 = () => {
  const [state] = useRelinx('goods')
  const { currentIndex, listData } = state

  if (typeof currentIndex === 'undefined' || !listData[currentIndex]) return null

  return (
    <>
      <span style={{ 'marginTop': '20px' }}>Current item</span>
      <GoodsItem data={listData[currentIndex]} />
    </>
  )
}

export default observe(CurrentItemV2)