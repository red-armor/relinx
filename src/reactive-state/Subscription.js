import getPathValue from './utils/getPathValue'
import deepEqual from './utils/deepEqual'

function pathExtractor(paths) {
  return paths.join('.')
}

class PathManager {
  constructor(context) {
    this.reactivePaths = new Set()
    this.pool = []
    this.context = context
  }

  /**
   *
   * @param {string} stubKey
   * @param {array} stub
   * @param {string} property
   *
   * The pending issue: The time to trigger reset `this.pool`;
   *  1. `lastStubKey !== stubKey`
   *  2. Revoking `getReactivePaths` method. It should be reconsidered in the future.
   */
  addPath({ stubKey, stub, property }) {
    const len = this.pool.length

    if (len) {
      const { stubKey: lastStubKey } = this.pool[len - 1]

      if (lastStubKey !== stubKey) {
        this.commitPath()
      }
    }
    this.pool.push({ stubKey, stub, property })
  }

  commitPath() {
    const { paths } = this.resolveReactivePath()
    this.reactivePaths = new Set([...this.reactivePaths, ...paths])
    return { paths: this.reactivePaths }
  }

  resolveReactivePath() {
    const info = this.pool.slice().reverse()
    this.pool = []

    const paths = []

    return info.reduce((acc, cur) => {
      const { info, paths } = acc
      info.unshift()

      const { stub, property } = cur
      stub.forEach(key => {
        const index = info.findIndex(({ property }) => property === key)

        if (index !== -1) {
          const { hit = 0 } = info[index]
          info[index].hit = hit + 1
        }
      })

      const { hit: currentHit } = cur

      if (!currentHit) {
        paths.push(pathExtractor(stub.concat(property)))

        // 这个目前主要是针对`array`情形，比如`['1'].map(key => <div />)`
        // 它会触发`constructor`, `map`, `length`三个`property`
        if (property === 'constructor') {
          paths.push(pathExtractor(stub))
        }
      }

      return { info, paths }
    }, { info, paths })
  }

  /**
   * `getReactivePaths` will reset `this.pool`, is it a reasonable solution ?
   */
  getReactivePaths() {
    const { paths } = this.commitPath()
    return new Set([ ...this.reactivePaths, ...paths ])
  }
}

class store {
  constructor(props) {
    this.subscriptions = new Map()
  }

  getPaths() {
    const paths = []
    for (const [_, value] of this.subscriptions) {
      paths.push(value.getReactivePaths())
    }

    return paths
  }

  notify(reactivePath, newValue, oldValue) {
    let nextReactivePath = reactivePath.slice()
    for (const [_, subscription] of this.subscriptions) {
      if (subscription.getReactivePaths) {
        const paths = subscription.getReactivePaths()
        let nextValue = oldValue

        if ([...paths].some(p => {
          const joinedPath = pathExtractor(reactivePath)
          if (p === joinedPath) {
            nextValue = newValue
            return true
          }

          if (p.startsWith(joinedPath)) {
            const joinedPathLength = reactivePath.length
            const parts = p.split('\.')
            const remainingKeys = parts.slice(joinedPathLength)

            try {
              const caredOldValue = getPathValue(oldValue, remainingKeys)
              const caredNewValue = getPathValue(newValue, remainingKeys)

              if (!deepEqual(caredNewValue, caredOldValue)) {
                nextValue = caredNewValue
                nextReactivePath = parts
                return true
              }
            } catch (err) {
              return false
            }
          }
        })) {
          subscription.context.update({
            path: nextReactivePath,
            type: 'set',
            newValue: nextValue,
          })
        }
      }
    }
  }

  mountSubscriber(props) {
    const { stubKey, stub, property, subscriberKey } = props
    const pathManager = this.subscriptions.get(subscriberKey)
    pathManager.addPath({ stubKey, property, stub })
  }

  update(operation, context) {
    const { onFlyProxyKey: subscriberKey, type, ...rest } = operation
    if (!this.subscriptions.has(subscriberKey)) {
      this.subscriptions.set(subscriberKey , new PathManager(context))
    }

    if (type === 'get') {
      this.mountSubscriber({ subscriberKey, ...rest })
    }
  }
}


export default store