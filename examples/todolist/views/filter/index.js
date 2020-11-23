import React from 'react';
import { observe } from 'relinx'
import Link from './link.js';
import {FilterTypes} from '../../util/commons'
import './style.css';

const Filters = () => {
  return (
    <p className="filters">
      <Link filter={FilterTypes.ALL}> {FilterTypes.ALL} </Link>
      <Link filter={FilterTypes.COMPLETED}> {FilterTypes.COMPLETED} </Link>
      <Link filter={FilterTypes.UNCOMPLETED}> {FilterTypes.UNCOMPLETED} </Link>
    </p>
  );
};

export default observe(Filters);
