import React from 'react';
import { observe } from 'relinx'
import {view as Todos} from './todos/';
import {view as Filter} from './filter/';

function TodoApp() {
  return (
    <div>
      <Todos />
      <Filter />
    </div>
  );
}

export default observe(TodoApp);
