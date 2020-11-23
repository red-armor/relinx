import React from 'react';
import { observe } from 'relinx'
import Todo from '../../views/todo';
import Filter from '../../views/filter';

function TodoApp() {
  return (
    <div>
      <Todo />
      <Filter />
    </div>
  );
}

export default observe(TodoApp);
