import React from 'react';
import { observe } from 'relinx'
import AddTodo from './AddTodo'
import TodoList from './TodoList'
import './style.css';

const Todo = () => {
  return (
    <div className="todos">
      <AddTodo />
      <TodoList />
    </div>
  );
}

export default observe(Todo)

