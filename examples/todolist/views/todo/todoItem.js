import React, { useCallback } from 'react';
import { observe, useDispatch } from 'relinx'
import { TOGGLE_TODO, REMOVE_TODO } from '../../util/commons'

const TodoItem = ({ completed, text, id }) => {
  const [dispatch] = useDispatch()
  const onToggle = useCallback(() => {
    dispatch({
      type: TOGGLE_TODO,
      payload: { id }
    })
  }, [id])

  const onRemove = useCallback(() => {
    dispatch({
      type: REMOVE_TODO,
      payload: { id }
    })
  }, [id])

  return (
    <li className="todo-item"
      style={{
        textDecoration: completed ? 'line-through' : 'none'
      }}
    >
      <input
        className="toggle"
        type="checkbox"
        checked={completed ? "checked" : ""}
        readOnly onClick={onToggle}
      />
      <label className="text">{text}</label>
      <button className="remove" onClick={onRemove}>×</button>
    </li>
  );
}
export default observe(TodoItem);

