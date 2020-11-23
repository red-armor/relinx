import React, { useMemo, useCallback } from 'react';
import { observe, useRelinx } from 'relinx'
import { SET_FILTER } from '../../util/commons'

const Link = ({ filter, children }) => {
  const [state, dispatch] = useRelinx('filter')
  const { filter: currentFilter } = state
  const active = useMemo(() => {
    return filter === currentFilter
  }, [filter, currentFilter])

  const onClick = useCallback((ev) => {
    ev.preventDefault();
    dispatch({
      type: SET_FILTER,
      payload: { filter }
    })
  }, [filter])

  if (active) {
    return <b className="filter selected">{children}</b>;
  } else {
    return (
      <a href="#" className="filter not-selected" onClick={onClick}>
        {children}
      </a>
    );
  }
};

export default observe(Link)
