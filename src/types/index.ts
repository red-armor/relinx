export * from './patcher';
export * from './createStore';
// export * from "./application";
export * from './provider';
export * from './observe';
export * from './context';
export * from './hooks';
export * from './applyMiddleware';
export * from './thunk';
export * from './store';
export * from './globalHelper';
export * from './autoRunner';
export * from './syntheticModelKeyManager';

// type Getters<T> = {
//   [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
// };

// interface Person {
//   name: string;
//   age: number;
//   location: string;
// }

// type LazyPerson = Getters<Person>;

// type Model = {
//   app: {
//     state: {
//       count: number,
//     },
//     reducers: {
//       setProps: () => void,
//       increment: () => void,
//     },
//     effects: {
//       fetch: () => () => void
//     }
//   },
//   goods: {
//     state: {
//       number: number,
//     },
//     reducers: {
//       setProps: () => void,
//       update: () => void,
//     },
//     effects: {
//       fetch: () => () => void
//     }
//   }
// }

// type transform<M, K> = M extends string ? K extends string ? `${M}/${K}` : void : void

// // type KM<T> = {
// //   [modelKey in keyof T]: modelKey extends string ? {
// //     [key in keyof T[modelKey]]: key extends 'reducers' ? {
// //       [reducerKey in keyof T[modelKey][key] as reducerKey extends string ?`${modelKey}/${reducerKey}` : reducerKey]: reducerKey
// //     }: key extends 'effects' ? {
// //       [effectKey in keyof T[modelKey][key] as effectKey extends string ?`${modelKey}/${effectKey}` : effectKey]: effectKey
// //     } : {}
// //   }[keyof T[modelKey]] : {}
// // }[keyof T]

// type KM<T> = {
//   [modelKey in keyof T]: modelKey extends string ? {
//     [key in keyof T[modelKey]]: key extends 'reducers' ? {
//       [reducerKey in keyof T[modelKey][key] as reducerKey extends string ?`${modelKey}/${reducerKey}` : reducerKey]: reducerKey
//     }: key extends 'effects' ? {
//       [effectKey in keyof T[modelKey][key] as effectKey extends string ?`${modelKey}/${effectKey}` : effectKey]: effectKey
//     } : {}
//   }[keyof T[modelKey]] : {}
// }[keyof T]

// type X = keyof KM<Model>

// type Merged<M> = {
//   [key in keyof M]: {
//     [k in keyof M[key]]: M[key][k]
//   }[]
// }

// type Y = Merged<X>
