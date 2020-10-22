import React, { useState, useCallback } from 'react';
import { observe, useDispatch } from 'relinx'
import { addTodo } from '../actions.js';
import { ADD_TODO } from '../actionTypes'

const AddTodo = () => {
  const [dispatch] = useDispatch()
  const [value, setValue] = useState('')

  const onAdd = useCallback((inputValue) => {
    dispatch({
      type: ADD_TODO,
      payload: addTodo(inputValue),
    })
  }, [])

  const onSubmit = useCallback((ev) => {
    ev.preventDefault();
    const inputValue = value;
    if (!inputValue.trim()) {
      return;
    }
    onAdd(inputValue)
    setValue('')
  }, [value, onAdd, setValue])

  const onInputChange = useCallback((event) => {
    setValue(event.target.value)
  }, [setValue])

  return (
    <div className="add-todo">
      <form onSubmit={onSubmit}>
        <input className="new-todo" onChange={onInputChange} value={value} />
        <button className="add-btn" type="submit">
          添加
          </button>
      </form>
    </div>
  )
}

export default observe(AddTodo)


