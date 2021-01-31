import Store from '../Store';

export interface Action {
  type: string;
  payload?: any;
}

export type ModelKey = 'state' | 'reducers' | 'effects' | 'subscriptions';

export type BasicModelType<T> = {
  [key in keyof T]: {
    state: any;
    reducers?: any;
    effects?: any;
    subscriptions?: any;
  };
};

export type CreateStoreFn<
  T extends BasicModelType<T>,
  K extends keyof T = keyof T
> = (configs: {
  models: CreateStoreOnlyModels<T>;
  initialValue?: {
    [key in K]?: any;
  };
}) => Store<T>;

// export type CreateStore<T = any> = {
//   [key in keyof T]: key extends 'models'
//     ? T[key] extends object
//       ? {
//           [modelKey in keyof T[key]]: T[key] extends object
//             ? CreateStore<T[key][modelKey]>
//             : T[key];
//         }
//       : T[key]
//     : key extends 'reducers'
//     ? {
//         [reducerKey in keyof T[key]]: (state: any, payload?: any) => any;
//       }
//     : key extends 'state'
//     ? {
//         [stateKey in keyof T[key]]: any;
//       }
//     : key extends 'effects'
//     ? {
//         [effectKey in keyof T[key]]: (
//           payload: any
//         ) => (dispatch: number, getState?: any) => void;
//       }
//     : never;
// };

type ExtractKey<T, key, K extends keyof T = keyof T> = K extends key
  ? T[K]
  : never;

type ExtractModelType<T> = ExtractKey<T, 'models'>;

export type ExtractStateType<
  T,
  Models extends ExtractModelType<T> = ExtractModelType<T>
> = {
  [key in keyof Models]: ExtractKey<Models[key], 'state'>;
};

export type ExtractReducersType<
  T,
  Models extends ExtractModelType<T> = ExtractModelType<T>
> = {
  [key in keyof Models]: ExtractKey<Models[key], 'reducers'>;
};

// export type CreateStoreOnlyModels<
//   T extends BasicModelType<T>,
//   S extends ExtractStateTypeOnlyModels<T> = ExtractStateTypeOnlyModels<T>
// > = {
//   [modelKey in keyof T]: {
//     [key in keyof Pick<T[modelKey], 'state'>]: {
//       [stateKey in keyof T[modelKey][key]]: T[modelKey][key][stateKey];
//     };
//   } &
//     {
//       [key in keyof Pick<T[modelKey], 'reducers'>]?: {
//         [reducerKey in keyof T[modelKey][key]]: (
//           state: S[modelKey],
//           payload: any
//         ) => void;
//       };
//     } &
//     {
//       [key in keyof Pick<T[modelKey], 'effects'>]?: {
//         [effectKey in keyof T[modelKey][key]]: (
//           payload: any
//         ) => (dispatch: Function, getState: () => S) => void;
//       };
//     };
// };

export type CreateStoreOnlyModels<
  T extends BasicModelType<T>,
  S extends ExtractStateTypeOnlyModels<T> = ExtractStateTypeOnlyModels<T>
> = {
  [modelKey in keyof T]: {
    [key in keyof T[modelKey]]?: key extends 'state'
      ? { [stateKey in keyof T[modelKey][key]]: T[modelKey][key][stateKey] }
      : key extends 'reducers'
      ? {
          [reducerKey in keyof T[modelKey][key]]: (
            state: S[modelKey],
            payload: any
          ) => Partial<S[modelKey]>;
        }
      : key extends 'effects'
      ? {
          [effectKey in keyof T[modelKey][key]]: (
            payload: any
          ) => (dispatch: Function, getState: () => S) => void;
        }
      : never;
  };
};

export type GetState<T> = () => ExtractStateTypeOnlyModels<T>;

export type ExtractStateTypeOnlyModels<Models> = {
  [key in keyof Models]: ExtractKey<Models[key], 'state'>;
};

export type ExtractReducersTypeOnlyModels<Models> = {
  [key in keyof Models]: ExtractKey<Models[key], 'reducers'>;
};

export type ExtractEffectsTypeOnlyModels<Models> = {
  [key in keyof Models]: ExtractKey<Models[key], 'effects'>;
};

export type ExtractSubscriptionsTypeOnlyModels<Models> = {
  [key in keyof Models]: ExtractKey<Models[key], 'subscriptions'>;
};

export type GenericState<T, K extends keyof T> = {
  [key in keyof T]: T[K];
};

export interface ChangedValueGroup<K> {
  storeKey: K;
  changedValue: object;
}

export type DataType = string | object | number | Array<any> | boolean;

export type GetReducerPayload<T> = T extends (S: any) => object
  ? void
  : T extends (S: any, payload: infer B) => object
  ? B extends any
    ? B
    : void
  : void;
type GetEffectPayload<T> = T extends (
  payload?: infer B
) => (dispatch?: Function, getState?: Function) => void
  ? B extends never // if B is not exist, it will be never...do not use unknown
    ? void
    : B extends DataType
    ? B
    : void // TODO: verify not unknown is ok.
  : void;

export type KeyValueTupleToObject<T extends [keyof any, any]> = {
  [K in T[0]]: Extract<T, [K, any]>[1];
};

export type GetKeys<T> = {
  [key in keyof T]: keyof T[key] extends string ? keyof T[key] : never;
}[keyof T];

export type GetStateKey<T> = GetKeys<ExtractStateTypeOnlyModels<T>>;

export type ReducerPayload<R> = {
  // In order to avoid return `unknown` type. unknown will cause MergedPayload to be unknown
  // 1. if reducers not exist, then it will be unknown.
  [key in keyof R]: keyof R[key] extends string
    ? {
        [k in keyof R[key]]: [k, GetReducerPayload<R[key][k]>];
      }[keyof R[key]]
    : never;
}[keyof R];

export type EffectPayload<E> = {
  // In order to avoid return `unknown` type.
  [key in keyof E]: keyof E[key] extends string
    ? {
        [k in keyof E[key]]: [k, GetEffectPayload<E[key][k]>];
      }[keyof E[key]]
    : never;
}[keyof E];

// export type EffectPayload<E> = {
//   [key in keyof E]: E[key] extends never
//     ? never
//     : {
//         [k in keyof E[key]]: [k, GetEffectPayload<E[key][k]>];
//       }[keyof E[key]];
// }[keyof E];

export type GetMergedPayload<
  T,
  R extends ExtractReducersTypeOnlyModels<T> = ExtractReducersTypeOnlyModels<T>,
  E extends ExtractEffectsTypeOnlyModels<T> = ExtractEffectsTypeOnlyModels<T>,
  RP extends ReducerPayload<R> = ReducerPayload<R>,
  EP extends EffectPayload<E> = EffectPayload<E>
> = RP | EP;

export type MergedP<KM, P> = {
  [key in keyof KM]: KM[key] extends keyof P ? P[KM[key]] : void;
} &
  P;

export type GetTotalKey<
  T,
  R extends ExtractReducersTypeOnlyModels<T> = ExtractReducersTypeOnlyModels<T>,
  E extends ExtractEffectsTypeOnlyModels<T> = ExtractEffectsTypeOnlyModels<T>,
  RK extends GetKeys<R> = GetKeys<R>,
  EK extends GetKeys<E> = GetKeys<E>
> = RK | EK;

export type SafeAction<
  T,
  P,
  A,
  R extends any = A extends string
    ? A extends keyof P
      ? P[A]
      : void // never will throw with error
    : T extends keyof P
    ? P[T]
    : void
> = R extends void
  ? {
      // If A is assigned with a value, type should be same as A
      type: A extends string ? A : T;
    }
  : {
      // If A is assigned with a value, type should be same as A
      type: A extends string ? A : T;
      // payload?: T extends keyof P ? P[T] : never;
      payload: R;
    };

/**
 * The key point is how to get `KeyMap`, `tupleToObject` seems to the only solution.
 */
export type CreateTuple<R> = {
  // In order to avoid return `unknown` type. unknown will cause MergedPayload to be unknown
  // 1. if reducers not exist, then it will be unknown.
  [key in keyof R]: keyof R[key] extends string
    ? {
      /**
       * https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types
       * https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
       * https://dev.to/phenomnominal/i-need-to-learn-about-typescript-template-literal-types-51po
       * template literal types is introduced in TS4.1
       *
       * However, tsdx will cause build error, Because it used typescript 3.x version.
       * https://github.com/formium/tsdx/issues/952#issuecomment-754120955
       * The solution could be resolved with `resolutions` option in package.json
       * https://github.com/formium/tsdx/issues/926#issuecomment-751936109
       *
       * However, `resolutions` is only supported in yarn, npm not works.
       * https://classic.yarnpkg.com/en/docs/selective-version-resolutions/
       * https://stackoverflow.com/questions/52416312/npm-equivalent-of-yarn-resolutions
       *
       * for tsdx, ts4.x will be supported in v0.16.0  https://github.com/formium/tsdx/milestone/4
       *
       * For recently, the solution is to use yarn instead !!! waiting for tsdx 0.16.0 release..
       *
       * Prettier support !!!
       * https://prettier.io/blog/2020/11/20/2.2.0.html maybe there is still some issues when using with tsdx
       * So it is disabled hear.
       */
        [k in keyof R[key]]: key extends string ? [`${key}/${k}`, k] : [key, k]; // eslint-disable-line
      }[keyof R[key]]
    : never;
}[keyof R];

export type Mapping<
  T,
  R extends ExtractReducersTypeOnlyModels<T> = ExtractReducersTypeOnlyModels<T>,
  E extends ExtractEffectsTypeOnlyModels<T> = ExtractEffectsTypeOnlyModels<T>,
  // RT extends CreateTuple<R | E> = CreateTuple<R | E>,
  // ET extends CreateTuple<E> = CreateTuple<E>,
  // RM extends KeyValueTupleToObject<RT> = KeyValueTupleToObject<RT>,
  // EM extends KeyValueTupleToObject<ET> = KeyValueTupleToObject<ET>,
> = KeyValueTupleToObject<CreateTuple<R|E>>

export type Dispatch<
  T,
  KM extends Mapping<T> = Mapping<T>,
  OKM extends keyof KM = keyof KM,
  TK extends GetTotalKey<T> = GetTotalKey<T>,
  MK extends OKM | TK = OKM | TK,
  P1 extends KeyValueTupleToObject<GetMergedPayload<T>> = KeyValueTupleToObject<
    GetMergedPayload<T>
  >,
  P extends MergedP<KM, P1> = MergedP<KM, P1>
> = <
  A1 extends MK = MK,
  A2 extends MK = MK,
  A3 extends MK = MK,
  A4 extends MK = MK,
  A5 extends MK = MK,
  A6 extends MK = MK,
  A7 extends MK = MK,
  A8 extends MK = MK,
  A9 extends MK = MK,
  A10 extends MK = MK,
  A11 extends MK = MK,
  A12 extends MK = MK,
  A13 extends MK = MK,
  A14 extends MK = MK,
  A15 extends MK = MK,
  A16 extends MK = MK,
  A17 extends MK = MK,
  A18 extends MK = MK,
  A19 extends MK = MK,
  A20 extends MK = MK,
  A21 extends MK = MK,
  A22 extends MK = MK,
  A23 extends MK = MK,
  A24 extends MK = MK,
  A25 extends MK = MK
>(
  action:
    | SafeAction<MK, P, A1>
    | [SafeAction<MK, P, A1>]
    | [SafeAction<MK, P, A1>, SafeAction<MK, P, A2>]
    | [SafeAction<MK, P, A1>, SafeAction<MK, P, A2>, SafeAction<MK, P, A3>]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>,
        SafeAction<MK, P, A15>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>,
        SafeAction<MK, P, A15>,
        SafeAction<MK, P, A16>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>,
        SafeAction<MK, P, A15>,
        SafeAction<MK, P, A16>,
        SafeAction<MK, P, A17>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>,
        SafeAction<MK, P, A15>,
        SafeAction<MK, P, A16>,
        SafeAction<MK, P, A17>,
        SafeAction<MK, P, A18>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>,
        SafeAction<MK, P, A15>,
        SafeAction<MK, P, A16>,
        SafeAction<MK, P, A17>,
        SafeAction<MK, P, A18>,
        SafeAction<MK, P, A19>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>,
        SafeAction<MK, P, A15>,
        SafeAction<MK, P, A16>,
        SafeAction<MK, P, A17>,
        SafeAction<MK, P, A18>,
        SafeAction<MK, P, A19>,
        SafeAction<MK, P, A20>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>,
        SafeAction<MK, P, A15>,
        SafeAction<MK, P, A16>,
        SafeAction<MK, P, A17>,
        SafeAction<MK, P, A18>,
        SafeAction<MK, P, A19>,
        SafeAction<MK, P, A20>,
        SafeAction<MK, P, A21>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>,
        SafeAction<MK, P, A15>,
        SafeAction<MK, P, A16>,
        SafeAction<MK, P, A17>,
        SafeAction<MK, P, A18>,
        SafeAction<MK, P, A19>,
        SafeAction<MK, P, A20>,
        SafeAction<MK, P, A21>,
        SafeAction<MK, P, A22>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>,
        SafeAction<MK, P, A15>,
        SafeAction<MK, P, A16>,
        SafeAction<MK, P, A17>,
        SafeAction<MK, P, A18>,
        SafeAction<MK, P, A19>,
        SafeAction<MK, P, A20>,
        SafeAction<MK, P, A21>,
        SafeAction<MK, P, A22>,
        SafeAction<MK, P, A23>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>,
        SafeAction<MK, P, A15>,
        SafeAction<MK, P, A16>,
        SafeAction<MK, P, A17>,
        SafeAction<MK, P, A18>,
        SafeAction<MK, P, A19>,
        SafeAction<MK, P, A20>,
        SafeAction<MK, P, A21>,
        SafeAction<MK, P, A22>,
        SafeAction<MK, P, A23>,
        SafeAction<MK, P, A24>
      ]
    | [
        SafeAction<MK, P, A1>,
        SafeAction<MK, P, A2>,
        SafeAction<MK, P, A3>,
        SafeAction<MK, P, A4>,
        SafeAction<MK, P, A5>,
        SafeAction<MK, P, A6>,
        SafeAction<MK, P, A7>,
        SafeAction<MK, P, A8>,
        SafeAction<MK, P, A9>,
        SafeAction<MK, P, A10>,
        SafeAction<MK, P, A11>,
        SafeAction<MK, P, A12>,
        SafeAction<MK, P, A13>,
        SafeAction<MK, P, A14>,
        SafeAction<MK, P, A15>,
        SafeAction<MK, P, A16>,
        SafeAction<MK, P, A17>,
        SafeAction<MK, P, A18>,
        SafeAction<MK, P, A19>,
        SafeAction<MK, P, A20>,
        SafeAction<MK, P, A21>,
        SafeAction<MK, P, A22>,
        SafeAction<MK, P, A23>,
        SafeAction<MK, P, A24>,
        SafeAction<MK, P, A25>
      ]
) => void;

//   export type Dispatch<
//   T,
//   KM extends {} = {},
//   OKM extends keyof KM = keyof KM,
//   TK extends GetTotalKey<T> = GetTotalKey<T>,
//   MK extends OKM | TK = OKM | TK,
//   P extends KeyValueTupleToObject<GetMergedPayload<T>> = KeyValueTupleToObject<
//     GetMergedPayload<T>
//   >
// > =
//   // (<A1 extends any>(
//   //     action: SafeAction<MK, P, A1>
//   //   ) => void) |
//   (<A1, A2>(
//       action: [SafeAction<MK, P, A1>, SafeAction<MK, P, A2>]
//     ) => void) |
//   (<A1, A2, A3>(
//     action: [
//       SafeAction<MK, P, A1>,
//       SafeAction<MK, P, A2>,
//       SafeAction<MK, P, A3>,
//     ]
//   ) => void)

// export type SafeAction<T, P, A> = {
//   // If A is assigned with a value, type should be same as A
//   type: A extends string ? A : T;
//   // payload?: T extends keyof P ? P[T] : never;
//   payload: A extends string
//     ? A extends keyof P
//       ? P[A]
//       : never
//     : T extends keyof P
//     ? P[T]
//     : never;
// };


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

// type KMR = ExtractReducersTypeOnlyModels<Model>
// type Red = CreateTuple<KMR>

// // type KM<T> = {
// //   [modelKey in keyof T]: modelKey extends string ? {
// //     [key in keyof T[modelKey]]: key extends 'reducers' ? {
// //       [reducerKey in keyof T[modelKey][key] as reducerKey extends string ?`${modelKey}/${reducerKey}` : reducerKey]: reducerKey extends string ? [`${modelKey}/${reducerKey}`, reducerKey] : reducerKey
// //     }: key extends 'effects' ? {
// //       [effectKey in keyof T[modelKey][key] as effectKey extends string ?`${modelKey}/${effectKey}` : effectKey]: effectKey extends string ?`${modelKey}/${effectKey}` : effectKey
// //     } : {}
// //   }[keyof T[modelKey]]: {}
// // }[keyof T]

// // type KM<
// //   T,
// //   modelKey extends keyof T = keyof T,
// //   R extends ExtractReducersTypeOnlyModels<T> = ExtractReducersTypeOnlyModels<T>,
// //   RK extends keyof R = keyof R
// // > = RK extends keyof T[modelKey]['reducers'] ? T[modelKey]['reducers'][RK] : string



// // export type CreateTuple<R> = {
// //   // In order to avoid return `unknown` type. unknown will cause MergedPayload to be unknown
// //   // 1. if reducers not exist, then it will be unknown.
// //   [key in keyof R]: keyof R[key] extends string
// //     ? {
// //         [k in keyof R[key]]: key extends string ? [`${key}/${k}`, k] : [k, k];
// //       }[keyof R[key]]
// //     : never;
// // }[keyof R];


// // type Mapping<
// //   T,
// //   R extends ExtractReducersTypeOnlyModels<T> = ExtractReducersTypeOnlyModels<T>,
// //   E extends ExtractEffectsTypeOnlyModels<T> = ExtractEffectsTypeOnlyModels<T>,
// //   RT extends CreateTuple<R> = CreateTuple<R>,
// //   ET extends CreateTuple<E> = CreateTuple<E>,
// //   RM extends KeyValueTupleToObject<RT> = KeyValueTupleToObject<RT>,
// //   EM extends KeyValueTupleToObject<ET> = KeyValueTupleToObject<ET>,
// // > = EM | RM


// type RedNext = KeyValueTupleToObject<Red>

// type m = Mapping<Model>

// type x = keyof m


// type TU<
//   T,
//   K extends keyof T= keyof T,
//   KT extends keyof T[K] = keyof T[K]
// > = K extends string ? KT extends string ? [`${K}/${KT}`, KT] : string : void
// // type TU<
// //   T,
// //   K extends keyof T= keyof T,
// //   KT extends keyof T[K] = keyof T[K]
// // > = K extends string ? KT extends string ? [`${K}/${KT}`, KT] : string : void

// // [`${K}/${KT}`, KT]
// type M = TU<KMR>

// type F = KM<Model>
// type XX = ExtractReducersTypeOnlyModels<KM<Model>>

// type FF<X, K extends keyof X = keyof X> = X[K] extends {} ? {
//   [key in keyof X[K]]: number
// } : string

// type Primitive = string | number | boolean | bigint | symbol | null | undefined;

// type Expand<T> = T extends Primitive ? T : { [K in keyof T]: T[K] };

// type getX = FF<XX, keyof XX>

// // export type ExtractReducersTypeOnlyModels<Models> = {
// //   [key in keyof Models]: ExtractKey<Models[key], 'reducers'>;
// // };
