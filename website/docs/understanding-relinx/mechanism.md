---
title: Mechanism
sidebar_position: 1
---

Conceptually, Relinx is inspired by lots of open source library likes `React-Redux`, `dva` etc. It includes `action`,`reducers`, `dispatch` and `effects` as well.

On handle side effect, In order to simplify learning curve and leverage usage complexity, Relinx do not apply any other library like `redux-saga` and use a variant of `redux-thunk`.

The Relinx design principle is very simple

> Collect accessed properties paths of component, then re-render component if bind pathNode detect value change.

![flow](./assets/flow.png)

1. A observed component will create a tracker and patcher. Tracker is used to collect access paths. Patcher is used to re-render component when access path value change.
2. Patcher will be added to top level application. According to patcher's paths value, application will create a PathNodeTree
3. Dispatch an action to reducer will create changed value group. In order to find which paths value has been updated, changed value will be passed to application.
4. In application, Based on created PathNodeTree, perform diff algorithm. If a pathNode is detected with value change. Its patcher will be pushed to pendingPatchers.
5. Once comparison and patcher clear up is finished. pendingPatchers will be trigger running. The related component will be re-rendered.
6. Component's re-render will cause the re-creation of tracker paths. component will patcher will be add to application again to update PathNodeTree.
