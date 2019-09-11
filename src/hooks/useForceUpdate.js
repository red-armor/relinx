import { useEffect, useState, useReducer } from 'react'

// export default () => {
//   const [ state, setState ] = useState(0)
//   setState(state + 1)
// }

const forcedReducer = state => state + 1;
const useForceUpdate = () => useReducer(forcedReducer, 0)[1];
export default useForceUpdate