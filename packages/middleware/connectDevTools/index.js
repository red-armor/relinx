import remoteDevDep from 'remotedev'

const connectDevToolsMiddle = ({dispatch, getState}) => {
  const initState = getState()
  const remoteDev = remoteDevDep.connectViaExtension({
    name: 'relinx-root',
    remote: true,
  })
  remoteDev.init(initState)
  console.log('initState', initState)
  
  return next => actions => {
    next(actions)
    remoteDev.send(actions, getState())
  }
  
}
export default connectDevToolsMiddle