import React, { useRef, useState, useContext, createContext, useCallback } from 'react'
import './style.css'

const MULTIPLIER = Math.pow(2, 24) // eslint-disable-line
const generateKey = () => Math.floor(Math.random() * MULTIPLIER).toString(32)
const defaultValue = {
  count: 1,
  title: generateKey()
}
const context = createContext(defaultValue)

const Main = () => {
  const [state, setState] = useState(defaultValue)
  const increment = useCallback(() => {
    setState(state => ({
      ...state,
      count: state.count + 1,
    }))
  }, [])

  const changeTitle = useCallback(() => {
    setState(state => ({
      ...state,
      title: generateKey()
    }))
  }, [])

  return (
    <context.Provider value={state}>
      <button onClick={increment} className="btn btn-primary">increment</button>
      <button onClick={changeTitle} className="btn btn-primary">changeTitle</button>
      <Title />
      <Counter />
    </context.Provider>
  )
}

const Title = () => {
  const contextValue = useContext(context)
  const { title } = contextValue
  const updateRef = useRef(0)
  updateRef.current += 1

  return (
    <div className="text">
      <div className="left">{`title: ${title}`} </div>
      <div className="right">{`update ${updateRef.current}`}</div>
    </div>
  )
}

const Counter = () => {
  const contextValue = useContext(context)
  const { count } = contextValue
  const updateRef = useRef(0)
  updateRef.current += 1

  return (
    <div className="text">
      <div className="left">{`count: ${count}`} </div>
      <div className="right">{`update ${updateRef.current}`}</div>
    </div>
  )
}

export default Main