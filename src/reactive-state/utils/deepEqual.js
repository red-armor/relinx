export default (oldValue, newValue) => {
  const oldValueType = typeof oldValue
  const newValueType = typeof newValue

  if (newValueType !== oldValueType) {
    return false
  }

  // 比较糙的比较
  return JSON.stringify(newValue) === JSON.stringify(oldValue)
}

