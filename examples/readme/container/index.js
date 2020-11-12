// app.js
import React, {useCallback} from "react"
import {useRelinx, observe} from "relinx"
import Info from '../views/info'

export default observe(() => {
  const [state, dispatch] = useRelinx("app")

  const {count} = state
  const handleClick = useCallback(() => dispatch({type: "app/increment"}), [])

  return (
    <div>
      <span>{count}</span>
      <button onClick={handleClick}>+</button>
      <Info />
    </div>
  )
})
