export default ({ getState, dispatch }) => next => actions => {
  console.log('action group : ', actions, {...getState().bottomBar})

  const actionGroup = next(actions)
  console.log('action group : ', actions, {...getState().bottomBar})

  return actionGroup
}