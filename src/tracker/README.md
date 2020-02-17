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

The following is an example about how to create an instance, and get its paths value. You can provide a `parent` param to specify the parent node, or the previous tracker will be considered as `parent`. The following image shows the basic logic implementation.

```js
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

const baseNode = Tracker({base: base.a})
const b = baseNode.proxy.b
baseNode.proxy.runFn("getRemarkableFullPaths") // [[ 'b' ]]

const childNode = Tracker({base: base.c})
const c = childNode.proxy.d
const f = childNode.proxy.e[0].f
const item = childNode.proxy.e[0]
childNode.proxy.runFn("getRemarkableFullPaths") // [["e", "0"], ["e", "0", "f"], ['d']]

const grandChildNode = Tracker({base: base.g})
const i = grandChildNode.proxy.h.i
const ff = item.f
grandChildNode.proxy.runFn("getRemarkableFullPaths") // [["h", "i"], ["e", "0", "f"]]
```

![tree.png](./docs/tree.png)

### What is relink

The following two image provide a straightforward explanation of why relink needs and how it works. The first one describe a general scenario when write react component: A parent component pass a item (props property) to each of its child component.

_note: for props property, please refer to definition listed on above_

![component_1.png](./docs/component_1.png)

Now one item's value update... So how to make a fine-grained rendering update...The answer could be `only trigger the updated value related component`.But there will come with a new issue, `{ count: 1 }` is a prop value passing from parent...If the parent component not re-render, how could I get the latest value..It's exactly the problem what `relink` attempt to resolve.

`break the old connection, then re-build a new link with child component`

![component_2.png](./docs/component_2.png)
