import React, { Reducer } from 'react'
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

// export type TotalState = ExtractStateTypeOnlyModels<Models>
// type TotalReducers = ExtractReducersTypeOnlyModels<Models>
// type TotalEffects = ExtractEffectsTypeOnlyModels<Models>

// type ReducerKeys = {
//   [key in keyof TotalReducers]: keyof TotalReducers[key] extends string ? keyof TotalReducers[key] : never
// }[keyof TotalReducers]
// type EffectKeys = {
//   [key in keyof TotalEffects]: keyof TotalEffects[key] extends string ? keyof TotalEffects[key] : never
// }[keyof TotalEffects]
// type TotalKeys = EffectKeys | ReducerKeys
// type effectFn = {
//   [key in keyof TotalEffects]: keyof TotalEffects[key] extends string ? {
//     [k in keyof TotalEffects[key]]: TotalEffects[key][k]
//   }[keyof TotalEffects[key]] : never
// }
// type GetFunction<T, K> = {
//   [key in keyof T]: K extends keyof T[key] ? T[key][K] : never
// }[keyof T]
// type GetEffect<K> = GetFunction<TotalEffects, K>
// type GetReducer<K> = GetFunction<TotalReducers, K>
// type GetDispatchFunction<K> = GetEffect<K> | GetReducer<K>

// type GetReducerPayload<T> = T extends (S: any) => object ? never
// : T extends (S: any, payload: infer B) => object ? B extends any ? B : never : never
// type GetEffectPayload<T> = T extends (payload?: infer B) => (dispatch?: Function, getState?: Function) => void ? B : never

// // 如果说没有payload的话，会造成unknown这个时候整个的值就是unknown
// // type GetEffectPayload<T> = T extends (payload?: infer B) => (dispatch?: Function, getState?: Function) => void ? B : never

// type GetPayload<T> = GetReducerPayload<T> | GetEffectPayload<T>

// type GetMergePayload<T> = T extends (S: any) => object ? never
// : T extends (S: any, payload: infer B) => object ? B extends any ? B : never
// : T extends (payload?: infer C) => (dispatch?: Function, getState?: Function) => void ? C extends unknown ? never : C : never

// type GetMergePayloadOrder<T> = T extends (payload?: infer C) => (dispatch?: Function, getState?: Function) => void ? C
//   : T extends (S: any, payload: infer B) => object ? B extends any ? B : never
//   : T extends (S: any) => object ? never : never

// // T extends (S: any) => object ? never
// // : T extends (S: any, payload: infer B) => object ? B extends any ? B : never
// // : T extends (payload?: infer C) => (dispatch?: Function, getState?: Function) => void ? C : never

// type GetMergePayload2<T> = T extends (payload?: infer C) => (dispatch?: Function) => void ? C : never

// // type Action<K> = {
// //   type: K,
// //   payload: GetMergePayload<GetDispatchFunction<K>>
// // }

// type Payload1 = GetDispatchFunction<TotalKeys>
// type Payload2 = GetReducerPayload<Payload1>
// type Payload3 = GetEffectPayload<Payload1>
// type Payload = GetPayload<GetDispatchFunction<TotalKeys>>
// type MergedPayload = GetMergePayload<GetDispatchFunction<EffectKeys>>
// type MergedPayload4 = GetMergePayload<GetDispatchFunction<TotalKeys>>
// type mergedPayloadOrder = GetMergePayloadOrder<GetDispatchFunction<TotalKeys>>
// type mergedPayloadOrder1 = GetMergePayloadOrder<GetDispatchFunction<ReducerKeys>>
// type mergedPayloadOrder2 = GetMergePayloadOrder<GetDispatchFunction<EffectKeys>>
// type Effect = GetDispatchFunction<EffectKeys>

// type MergedPayload2 = GetMergePayload<GetDispatchFunction<EffectKeys>>
// type MergedPayload3 = GetMergePayload<GetDispatchFunction<ReducerKeys>>

// // export type Dispatch<T> = (action: Action<T> | Array<Action<T>>) => void

// type NextReducerPayload = {
//   [key in keyof TotalReducers]: {
//     [k in keyof TotalReducers[key]]: [k, GetReducerPayload<TotalReducers[key][k]>]
//   }[keyof TotalReducers[key]]
// }[keyof TotalReducers]

// type NextEffectPayload = {
//   [key in keyof TotalEffects]: TotalEffects[key] extends never ? never : {
//     [k in keyof TotalEffects[key]]: [k, GetEffectPayload<TotalEffects[key][k]>]
//   }[keyof TotalEffects[key]]
// }[keyof TotalEffects]

// type TotalPayload = NextEffectPayload | NextReducerPayload

// type M = KeyValueTupleToObject<TotalPayload>


// type Action<K> = {
//   type: K,
//   payload: K extends keyof KeyValueTupleToObject<TotalPayload> ? KeyValueTupleToObject<TotalPayload>[K] : never
// }

// type never$object = never extends object ? number : string
// type never$unknown = never extends unknown ? number : string
// type object$unknown = object extends unknown ? number : string
// type never$never = never extends never ? number : string
// type object$never = object extends never ? number : string
// type extends$never = never extends never ? number : string
// type any$string = any extends string ? number : string
// type never$string = never extends string ? number : string


// type PP = {
//   'addGoods': string
// }

// export type Merged = {
//   [key in keyof KeyMap]: KeyMap[key] extends keyof PP ? PP[KeyMap[key]] : never
// }

// type TestMp = MergedP<KeyMap, PP>

// type TestKeyMap<C, P> = C extends keyof KeyMap ? KeyMap[C] extends keyof P ? P[KeyMap[C]] : never : never
// // type TestKeyMap2<C, P> = C extends keyof KeyMap ? KeyMap[C] extends keyof P ? KeyMap[C] ? KeyMap[C] extends keyof P ? P[KeyMap[C]]: never : never

// type PM = TestKeyMap<'init/addGoods', PP>

// type KeyValueTupleToObject<T extends [keyof any, any]> = {
//   [K in T[0]]: Extract<T, [K, any]>[1]
// }

// type GetKeys<T> = {
//   [key in keyof T]: keyof T[key] extends string ? keyof T[key] : never
// }[keyof T]

// type ReducerPayload<R> = {
//   [key in keyof R]: {
//     [k in keyof R[key]]: [k, GetReducerPayload<R[key][k]>]
//   }[keyof R[key]]
// }[keyof R]

// type EffectPayload<E> = {
//   [key in keyof E]: E[key] extends never ? never : {
//     [k in keyof E[key]]: [k, GetEffectPayload<E[key][k]>]
//   }[keyof E[key]]
// }[keyof E]

// type GetMergedPayload<
//   T,
//   R extends ExtractReducersTypeOnlyModels<Models> = ExtractReducersTypeOnlyModels<Models>,
//   E extends ExtractEffectsTypeOnlyModels<Models> = ExtractEffectsTypeOnlyModels<Models>,
//   RP extends ReducerPayload<R> = ReducerPayload<R>,
//   EP extends EffectPayload<E> = EffectPayload<E>,
// > = RP | EP

// type GetTotalKey<
//   T,
//   R extends ExtractReducersTypeOnlyModels<T> = ExtractReducersTypeOnlyModels<T>,
//   E extends ExtractEffectsTypeOnlyModels<T> = ExtractEffectsTypeOnlyModels<T>,
//   RK extends GetKeys<R> = GetKeys<R>,
//   EK extends GetKeys<E> = GetKeys<E>,
// > = RK | EK

// type MergedP<KM, P> = {
//   [key in keyof KM]: KM[key] extends keyof P ? P[KM[key]] : never;
// } & P

// export type Dispatch<
//   T,
//   KM,
//   OKM extends keyof KM = keyof KM,
//   TK extends GetTotalKey<T> = GetTotalKey<T>,
//   MK extends OKM | TK = OKM | TK,
//   P extends KeyValueTupleToObject<GetMergedPayload<T>> = KeyValueTupleToObject<GetMergedPayload<T>>,
//   MP extends MergedP<KM, P> = MergedP<KM, P>
// // > = <C extends any = void, D extends any = void>(action: SafeAction<MK, P, C, D> | Array<SafeAction<MK, P, C, D>>) => void
// > = <
//   C extends any = void,
//   D extends any = void,
//   E extends any = void,
// >(action: SafeAction<MK, MP, C> | [SafeAction<MK, MP, C>, SafeAction<MK, MP, D>, SafeAction<MK, MP, E>]) => void


// // type SafeAction<T, P, C> = {
// //   // payload?: C extends keyof P ? P[C] : never,
// //   // payload?: C extends never ? T extends keyof P ? P[T] : C extends keyof P ? P[C] : never : never,
// //   payload?: C extends string ? C extends keyof P ? P[C] : never : T extends keyof P ? P[T] : never,
// //   // payload?:
// //   //   C extends string ?
// //   //     C extends keyof P
// //   //       ? P[C]
// //   //       : C extends keyof KM
// //   //         ? KM[C] extends keyof P
// //   //           ? P[KM[C]]   // 不知道为啥这个不能够用，所以最终通过MergeP的方式来实现了
// //   //           : never
// //   //         : T extends keyof P
// //   //           ? P[T]
// //   //           : never
// //   //     : never
// //   type: T,
// // }
// type SafeAction<
//   T,
//   P,
//   A,
//   R extends any = A extends string
//     ? A extends keyof P
//       ? P[A]
//       : void
//     : T extends keyof P
//       ? P[T]
//       : void
// > = R extends void
//   ? {
//     // If A is assigned with a value, type should be same as A
//     type: A extends string ? A : T;
//   }
//   : {
//     // If A is assigned with a value, type should be same as A
//     type: A extends string ? A : T;
//     // payload?: T extends keyof P ? P[T] : never;
//     payload: R
//   };


// type TestSafeAction = SafeAction<TotalKeys, M, 'decrement'>
// type TestSafeAction2 = SafeAction<TotalKeys, M, 'bottomBar/incrementTotalCount'>

// // function next<T>(dispatch: Dispatch<Models, KeyMap>)

// function test (dispatch: Dispatch<Models, KeyMap>)  {
//   dispatch<'increment'>({
//     type: 'increment',
//     payload: {
//       ba: 'x',
//     }
//   })

//   dispatch<'decrement'>({
//     type: 'decrement',
//     payload: {name: 'x'},
//   // }, {
//   //   type: 'increment',
//   //   payload: {},
//   // }, {
//   //   type: 'init/decrement',
//   //   payload: {},
//   })

//   // dispatch([{
//   //   type: 'incrementTotalCount',
//   //   payload: {
//   //     ba: 'x',
//   //   }
//   // }, {
//   //   type: 'bottomBar/incrementTotalCount',
//   //   payload: {
//   //     name: '3',
//   //   }
//   // }])

//   // dispatch([{
//   //   type: 'increment',
//   //   payload: {
//   //     id: 'name',
//   //     index: 3,
//   //   }
//   // }, {
//   //   type: 'decrement',
//   //   payload: {
//   //     name: 'hello'
//   //   }
//   // }, {
//   //   type: 'incrementItemCount',
//   //   payload: {
//   //     name: 'x'
//   //   }
//   // }, {
//   //   type: 'updatePage',
//   // }, {
//   //   type: 'bottomBar/incrementTotalCount',
//   // }])
// }