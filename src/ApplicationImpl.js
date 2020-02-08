import invariant from 'invariant'

class ApplicationImpl {
  constructor(base) {
    this.base = base
  }

  update(changedValues) {
    console.log('changed value ', changedValues)
  }

  getStoreData(storeName) {
    const storeValue = this.base[storeName]

    // on iOS 10. toString(new Proxy({}, {}) === 'object ProxyObject')
    invariant(
      !!storeValue,
      `Invalid storeName '${storeName}'.` +
      'Please ensure `base[storeName]` return non-undefined value '
    )

    return storeValue
  }
}

export default ApplicationImpl