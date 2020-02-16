# Tracker

_Track the getter action of wrapped object and provide ability to `relink` when upstream object's value changed_

> The original idea is to provide a solution on collecting the used property when render a react component. With this purpose, the question become how to utilize getter trap. `Proxy` has been supported by most of browser engine.. So how about the ES5 users?

> With these concern, an absolutely fantastic library [immer](https://github.com/immerjs/immer) give me the inspiration.

## Scope

when develop an app, state is designed to connect with UI view. state's value change will trigger UI update. Combined with [scope](<https://en.wikipedia.org/wiki/Scope_(computer_science)>) concept, it become possible to isolate the paths collector and simplify the result when it has nest group. Here we introduce some necessary definition.

1. **own properties**: It's the base data.
2. **props**: Following the basic concept in React, it's the value passing from upstream parent component.
3. **prop properties**: when you has a nested independent scope, the **props** passing from parent component will be called `prop properties`.
4. **Tracker**: To create an independent scope.
5. **Proxy State**: Implement the getter trap functionality.

![scope_1.png](./docs/scope.png)

Then it has following design rules:

1. A `Tracker` could have multiple child `Tracker` instance.
2. A `Tracker` has at most one `Proxy State`.
3. A `Proxy State` could have multiple child `Proxy State`
4. `Proxy State` will report `paths` to self or to ancestor `Proxy State` which has no null parent `Proxy State`.

### Implementation

```js
import Tracker from "./"
const base = {
  a: {
    b: 1
  },
  c: {
    d: 2,
    e: [{f: 1}]
  },
  g: {
    h: {i: 4}
  }
}

// On runtime, it means we have entered into baseNode's context scope.
const baseNode = Tracker({base: base.a})
// when get base value from 'baseNode', an access path ['a'] will be appended to
// baseNode's TRACKER object
const b = baseNode.proxy.b

// Enter into nextBaseNode.
const childBaseNode = Tracker({base: base.c})
// access path ['a'] will be added to nextBaseNode's TRACKER object
const c = childBaseNode.proxy.d
const f = childBaseNode.proxy.e[0].f
const item = childBaseNode.proxy.e[0]

const grandChildBaseNode = Tracker({base: base.g})
const i = grandChildBaseNode.proxy.h.i
const ff = item.f
```

![tree.png](./docs/tree.png)
