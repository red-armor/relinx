import React from 'react';
import { observe, useRelinx } from 'relinx'
import TodoItem from './todoItem.js';

const TodoList = () => {
  const [state] = useRelinx('todo')
  const { filteredTodos } = state

  return (
    <ul className="todo-list">
    {
      filteredTodos.map((item) => (
        <TodoItem
          key={item.id}
          id={item.id}
          text={item.text}
          completed={item.completed}
        />
        ))
    }
    </ul>
  );
};

export default observe(TodoList)
