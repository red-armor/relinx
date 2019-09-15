import print from './print'

export default ({ getState }) => next => actions => {
  const startTime = Date.now()
  const actionGroup = next(actions)
  const endTime = Date.now()
  print({
    prevState: {},
    nextState: {},
    initialActions: actions,
    actionGroup: [],
    startTime,
    endTime,
  })

  return actionGroup
}