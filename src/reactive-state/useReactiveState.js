import createProxyOnFly from './createProxyOnFly'

let subscriberCount = 0
const keyExtractor = () => `subscriber_${subscriberCount}`

export default (provider, name) => {
  subscriberCount += 1
  const key = name || keyExtractor()
  const { subscriptions, initialState } = provider
  const registerOperation = (props, context) => {
    subscriptions.update(props, context)
  }

  return new createProxyOnFly({
    key,
    initialState,
    registerOperation,
  })
}