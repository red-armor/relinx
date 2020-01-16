import invariant from 'invariant'
import Application from './Application'

class Central {
  constructor() {
    this.applications = new Map()
    this.stack = []
  }

  addApplication({ namespace, dispatch, initialValue }) {
    invariant(
      !this.applications.has(namespace),
      `Namespace duplicate issue. ${namespace} has been occupied by other application, ` +
      'please choose a new one'
    )

    this.applications.set(namespace, new Application(initialValue, dispatch))

    return () => {
      this.applications.delete[namespace]
    }
  }

  setCurrentComputation(computation) {
    this.currentComputation = computation
  }

  resetCurrentComputation(beforeComputation) {
    this.currentComputation = beforeComputation
  }

  getCurrentState(namespace) {
    const application = this.applications.get(namespace)
    return application.initialValue
  }

  /**
   *
   * @param {*} paths
   * @param {*} newValue
   * @param {*} namespace
   */
  reconcileWithPaths(paths, newValue, namespace) {
    const application = this.applications.get(namespace)
    return application.reconcileWithPaths(paths, newValue)
  }

  getApplication(namespace) {
    const application = this.applications.get(namespace)
    if (!application) throw new Error(
      `this.applications ${this.applications} do not have value with key ${namespace}`
    )
    return application
  }

  addDepends(paths, comp, namespace) {
    const application = this.getApplication(namespace)
    application.addDepends(paths, comp)
  }

  hitMapKey(paths) {
    if (paths.length) return paths.join('_')
    return ''
  }

  addDependsIfPossible(state) {
    const len = state.length
    if (!state.length) return

    for (let i = len - 1; i >= 0; i--) {
      const current = state[i]
      const { paths, property, comp, namespace } = current
      const mergedPaths = paths.concat(property)
      const hitKey = this.hitMapKey(mergedPaths)
      const hitValue = this.hitMap[hitKey] || 0

      if (!hitValue) {
        this.addDepends(mergedPaths, comp, namespace)
      }

      this.hitMap[hitKey] = Math.max(0, hitValue - 1)
    }
  }

  flush() {
    const focusedStack = this.stack
    this.stack = []
    this.hitMap = {}
    if (focusedStack.length) {
      this.addDependsIfPossible(focusedStack)
    }
  }
}

export default new Central()