import React, { useCallback } from "react"
import {logger, Provider, createStore, applyMiddleware, thunk, observe, useRelinx } from "relinx"

const createAppModel = () => ({
  state: {count: 0},
  reducers: {
    increment: state => ({count: state.count + 1})
  }
})

const createInfoModel = () => ({
  state: {count: 0},
  reducers: {
    setProps: (_, payload) => ({ ...payload })
  },
  subscriptions: {
    listenCount: ({ getState }) => {
      const { counter: { count }} = getState()
      return {
        type: 'setProps',
        payload: { count }
      }
    }
  }
})

const models = ({
  counter: createAppModel(),
  info: createInfoModel(),
})

const store = createStore({ models }, applyMiddleware(thunk, logger))

const Info = () => {
  const [state] = useRelinx('info')

  return (
    <div>
      {`current count ${state.count}`}
    </div>
  )
}

const Counter = () => {
  const [state, dispatch] = useRelinx("counter")

  const {count} = state
  const handleClick = useCallback(() => dispatch({type: "counter/increment"}), [])

  return (
    <div>
      <span>{count}</span>
      <button onClick={handleClick}>+</button>
    </div>
  )
}

const ObservedInfo = observe(Info)
const ObserveCounter = observe(Counter)

export default () => (
  <Provider store={store}>
    <ObserveCounter />
    <ObservedInfo />
  </Provider>
)