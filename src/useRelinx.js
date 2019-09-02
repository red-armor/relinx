import React, { useState } from 'react'

export default () => {
  const [state, setState] = useState(0)

  useEffect(() => {
    setState(state + 1)
  })
  return null
}
