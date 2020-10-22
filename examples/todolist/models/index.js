import Todos from '../todos/modules/todos'
import Filter from '../filter/modules/filter'

export default () => {
  const result = {
    todos: Todos(),
    filter: Filter()
  }
  return result
}