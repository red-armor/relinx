import invariant from 'invariant'
import Application from './Application'

class Central {
  constructor() {
    this.applications = new Map()
    this.stack = []
  }

  addApplication({ namespace, dispatch, initialState }) {
    invariant(
      !this.applications.has(namespace),
      `Namespace duplicate issue. ${namespace} has been occupied by other application, `
      + 'please choose a new one'
    )

    this.applications.set(namespace, new Application(initialState, dispatch))

    return () => this.applications.delete[namespace]
  }

  setCurrentComputation(computation) {
    this.currentComputation = computation
  }

  resetCurrentComputation(beforeComputation) {
    this.currentComputation = beforeComputation
  }

  getCurrentState(namespace) {
    const application = this.applications.get(namespace)
    return application.state
  }

  register({ namespace, ...rest }) {
    const application = this.applications.get(namespace)
    application.register(rest)
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
    invariant(
      application,
      `this.applications ${this.applications} do not have value with key ${namespace}`
    )
    return application
  }

  addDepends(paths, comp, namespace) {
    const application = this.getApplication(namespace)
    application.addDepends(paths, comp)
  }

  flush(namespace) {
    const application = this.applications.get(namespace)
    application.flush()
  }
}

export default new Central()
