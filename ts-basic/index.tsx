import React from 'react'
import ReactDOM from 'react-dom'
import {
  logger,
  Provider,
  createStore,
  applyMiddleware,
  thunk,
} from '../src'
import createModel from './models'
import { Models } from './types'
import { ExtractEffectsTypeOnlyModels, ExtractReducersTypeOnlyModels, ExtractStateTypeOnlyModels } from '../src/types'

import App from './container'

const models = createModel()

type test = typeof models

const store = createStore<Models>({ models }, applyMiddleware(thunk, logger))

store.subscribe(({ oldState, newState, diff }) => {
  const { init } = oldState
  const data = init.page
})

const Basic = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

ReactDOM.render(<Basic />, document.getElementById('app'))


export type TotalState = ExtractStateTypeOnlyModels<Models>
type TotalReducers = ExtractReducersTypeOnlyModels<Models>
type TotalEffects = ExtractEffectsTypeOnlyModels<Models>

type ReducerKeys = {
  [key in keyof TotalReducers]: keyof TotalReducers[key] extends string ? keyof TotalReducers[key] : never
}[keyof TotalReducers]
type EffectKeys = {
  [key in keyof TotalEffects]: keyof TotalEffects[key] extends string ? keyof TotalEffects[key] : never
}[keyof TotalEffects]

type totalKeys = ReducerKeys | EffectKeys

type map = {
  incrementTotalCount: 'bottomBar/incrementTotalCount',
  decrementTotalCount: 'bottomBar/decrementTotalCount',
}

type nextKeys = {
  [key in totalKeys]:
}


type dispatch = ({
  type, payload
}: {
  payload: any;
  type: {
    [key in keyof TotalReducers]: keyof TotalReducers[key]
  }
}) => void


type SomeMoreDataMapping = {
  prop1: "prop1Change"
  prop2: "prop2Change"
}
type ValueOf<T> = T[keyof T]
type KeyValueTupleToObject<T extends [keyof any, any]> = {
  [K in T[0]]: Extract<T, [K, any]>[1]
}
// type MapKeys<T, M extends Record<string, string>> =
//   KeyValueTupleToObject<ValueOf<{
//     [K in keyof T]: [K extends keyof M ? M[K] : K, T[K]]
//   }>>


type t = ValueOf<SomeMoreDataMapping>
type t2 = RequiredKeys<SomeMoreDataMapping>


type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];



type MapKeys<T, M extends Record<string, string>> =
  KeyValueTupleToObject<ValueOf<{
    [K in RequiredKeys<T>]-?: [K extends keyof M ? M[K] : K, T[K]]
  }>> & Partial<KeyValueTupleToObject<ValueOf<{
    [K in OptionalKeys<T>]-?: [K extends keyof M ? M[K] : K, T[K]]
  }>>> extends infer O ? { [K in keyof O]: O[K] } : never;

type MapKeys2<T, M extends Record<string, string>> =
  ValueOf<{
    [K in RequiredKeys<T>]-?: [K extends keyof M ? M[K] : K, T[K]]
  }>

function makeTheChange<T>(input: T): MapKeys<T, SomeMoreDataMapping> {
  var ret = {} as MapKeys<T, SomeMoreDataMapping>;
  for (var k in input) {
    // lots of any needed here; hard to convince the type system you're doing the right thing
    var nk: keyof typeof ret = ((k === 'prop1') ? 'prop1Change' : (k === 'prop2') ? 'prop2Change' : k) as any;
    ret[nk] = input[k] as any;
  }
  return ret;
}

var changed = makeTheChange({ prop1: 'Gypsy', prop2: 'Tom', prop3: 'Crow' });
console.log(changed.prop1Change.charAt(0)); //ok
console.log(changed.prop2Change.charAt(0)); //ok
console.log(changed.prop3.charAt(0)); //ok

type tt = MapKeys2<{ prop1: 'Gypsy', prop2: 'Tom', prop3: 'Crow' }, SomeMoreDataMapping>
type tt2 = KeyValueTupleToObject<tt>
type tt3 = tt2 extends infer O ? { [K in keyof O]: O[K] } : never;