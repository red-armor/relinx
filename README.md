# Relinx

[![npm version](https://img.shields.io/npm/v/relinx.svg?style=flat)](https://www.npmjs.com/package/relinx) [![NPM downloads](https://img.shields.io/npm/dm/relinx.svg?style=flat-square)](http://www.npmtrends.com/relinx) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

_A fast, intuitive, access path based reactive react state management_

## Features

1. `ES5` and `ES6` supported. use traps functions to collect accessed property path of React component.
2. When base data updates, relink the changed proxy object and leave others untouched.
3. PathNodeTree is the data structure to perform diff action. In Relinx, Only accessed property paths are used to build pathNodeTree which help to optimize comparison performance.
4. In order to embrace React-Redux community, middleware is re-write base on `Redux middleware`.
5. Fine-grained render controls. According to pathNodeTree, we can get which connected component should update when base value changes.

## Introduction

Relinx is inspired by lots of open source library likes `React-Redux`, `dva` etc.
