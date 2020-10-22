import React, { useCallback } from 'react';
import { observe, useDispatch } from 'relinx'
import { toggleTodo, removeTodo } from '../actions.js';
import { TOGGLE_TODO, REMOVE_TODO } from '../actionTypes'

const TodoItem = ({ completed, text, id }) => {
  const [dispatch] = useDispatch()
  const onToggle = useCallback(() => {
    dispatch({
      type: TOGGLE_TODO,
      payload: toggleTodo(id),
    })
  }, [id])

  const onRemove = useCallback(() => {
    dispatch({
      type: REMOVE_TODO,
      payload: removeTodo(id),
    })
  }, [id])

  return (
    <li className="todo-item"
      style={{
        textDecoration: completed ? 'line-through' : 'none'
      }}
    >
      <input className="toggle" type="checkbox" checked={completed ? "checked" : ""} readOnly onClick={onToggle} />
      <label className="text">{text}</label>
      <button className="remove" onClick={onRemove}>×</button>
    </li>
  );
}
export default observe(TodoItem);

