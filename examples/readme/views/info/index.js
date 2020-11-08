import React from 'react'
import {useRelinx, observe} from "relinx"

const Info = () => {
  const [state] = useRelinx('info')

  return (
    <div>
      {`current count ${state.count}`}
    </div>
  )
}

export default observe(Info)