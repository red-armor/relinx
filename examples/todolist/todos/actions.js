let nextTodoId = 10;

export const addTodo = (text) => ({
  completed: false,
  id: nextTodoId ++,
  text: text
});

export const toggleTodo = (id) => ({
  id,
});

export const removeTodo = (id) => ({
  id,
});

