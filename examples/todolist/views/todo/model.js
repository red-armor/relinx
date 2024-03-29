import { FilterTypes } from '../../util/commons'

const defaultTodos = [
  {
    id: 0,
    text: 'First',
    completed: true
  },
  {
    id: 1,
    text: 'Second',
    completed: false
  },
  {
    id: 2,
    text: 'Third',
    completed: true
  }
]

export default () => ({
  state: {
    todos: defaultTodos,
    filteredTodos: [],
  },
  reducers: {
    add: (state, payload) => {
      const { todos } = state
      const newTodos = [{
        id: payload.id,
        text: payload.text,
        completed: false
      }, ...todos]
      return {
        todos: newTodos
      }
    },
    remove: (state, payload) => {
      const newTodos = state.todos.filter((todoItem) => {
        return todoItem.id !== payload.id;
      })
      return {
        todos: newTodos
      }
    },
    toggle: (state, payload) => {
      const newTodos = state.todos.map((todoItem) => {
        if (todoItem.id === payload.id) {
          return { ...todoItem, completed: !todoItem.completed };
        } else {
          return todoItem;
        }
      })
      return {
        todos: newTodos
      }
    },
    setProps: (_, payload) => ({ ...payload })
  },
  subscriptions: {
    setup({ getState }) {
      const state = getState()
      const { filter, todo } = state
      const { filter: filterType } = filter
      const { todos: todoList } = todo

      let filteredTodos

      switch (filterType) {
        case FilterTypes.ALL:
          filteredTodos = [...todoList]
          break;
        case FilterTypes.COMPLETED:
          filteredTodos = todoList.filter(item => item.completed)
          break;
        case FilterTypes.UNCOMPLETED:
          filteredTodos = todoList.filter(item => !item.completed)
          break;
        default:
          break;
      }

      return {
        type: 'setProps',
        payload: {
          filteredTodos,
        }
      }
    }
  }
})
