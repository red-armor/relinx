import createProxyOnFly from './createProxyOnFly'

let subscriberCount = 0
const keyExtractor = () => `subscriber_${subscriberCount}`

export default provider => {
  subscriberCount += 1
  const key = keyExtractor()
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