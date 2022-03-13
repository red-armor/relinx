---
title: Getting Started
sidebar_position: 1
---

[![npm version](https://img.shields.io/npm/v/relinx.svg?style=flat)](https://www.npmjs.com/package/relinx) [![NPM downloads](https://img.shields.io/npm/dm/relinx.svg?style=flat-square)](http://www.npmtrends.com/relinx) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

__A fast, intuitive, access path based reactive react state management__

## Features

- `ES5` and `ES6` supported. use traps functions to collect accessed property path of React component.
- When base data updates, relink the changed proxy object and leave others untouched.
- `PathNodeTree` is the data structure to perform diff action. In Relinx, Only accessed property paths are used to build `pathNodeTree` which help to optimize comparison performance.
- In order to embrace `React-Redux` community, middleware is re-write base on `Redux middleware`.
- Fine-grained render controls. According to `pathNodeTree`, we can know which component should update when base value changes.
- Functional component only, and React `Hooks` supported

## Installation

```bash
$ npm install @xhs/relinx --save
```