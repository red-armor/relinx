import React from 'react';
import { observe } from 'relinx'
import AddTodo from './addTodo.js';
import TodoList from './todoList.js';
import './style.css';

const todos = () => {
  return (
    <div className="todos">
      <AddTodo />
      <TodoList />
    </div>
  );
}

export default observe(todos)

