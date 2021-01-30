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
  [key in keyof R]: {
    [k in keyof R[key]]: [k, GetReducerPayload<R[key][k]>];
  }[keyof R[key]];
}[keyof R];

export type EffectPayload<E> = {
  [key in keyof E]: E[key] extends never
    ? never
    : {
        [k in keyof E[key]]: [k, GetEffectPayload<E[key][k]>];
      }[keyof E[key]];
}[keyof E];

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
> =
  /**
   * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type
   * In TS 3.0 `unknown` become a new type, payload will be unknown type if it is not provided.
   *
   * dispatch({ type: 'app/init' })
   */
  R extends void | unknown
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

export type Dispatch<
  T,
  KM extends {} = {},
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
