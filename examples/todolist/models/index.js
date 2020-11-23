import createTodoModel from '../views/todo/model'
import createFilterModel from '../views/filter/model'

export default () => ({
  todo: createTodoModel(),
  filter: createFilterModel(),
})