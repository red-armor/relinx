import print from './print'

export default ({ getState }) => next => actions => {
  const startTime = Date.now()
  const prevState = JSON.parse(JSON.stringify(getState()))
  const actionGroup = next(actions)
  const nextState = JSON.parse(JSON.stringify(getState()))
  const endTime = Date.now()

  print({
    prevState,
    nextState,
    initialActions: actions,
    startTime,
    endTime,
  })

  return actionGroup
}