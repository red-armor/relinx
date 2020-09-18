import Store from '../Store';

export interface Action {
  type: string;
  payload?: any;
}

export type ModelKey = 'state' | 'reducers' | 'effects';

export type BasicModelType<T> = {
  [key in keyof T]: {
    state: any;
    reducers?: any;
    effects?: any;
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

export type ExtractStateTypeOnlyModels<Models> = {
  [key in keyof Models]: ExtractKey<Models[key], 'state'>;
};

export type ExtractReducersTypeOnlyModels<Models> = {
  [key in keyof Models]: ExtractKey<Models[key], 'reducers'>;
};

export type ExtractEffectsTypeOnlyModels<Models> = {
  [key in keyof Models]: ExtractKey<Models[key], 'effects'>;
};

export type GenericState<T, K extends keyof T> = {
  [key in keyof T]: T[K];
};

export interface ChangedValueGroup<K> {
  storeKey: K;
  changedValue: object;
}

export type GetReducerPayload<T> = T extends (S: any) => object
  ? never
  : T extends (S: any, payload: infer B) => object
  ? B extends any
    ? B
    : never
  : never;
type GetEffectPayload<T> = T extends (
  payload?: infer B
) => (dispatch?: Function, getState?: Function) => void
  ? B
  : never;

export type KeyValueTupleToObject<T extends [keyof any, any]> = {
  [K in T[0]]: Extract<T, [K, any]>[1];
};

export type GetKeys<T> = {
  [key in keyof T]: keyof T[key] extends string ? keyof T[key] : never;
}[keyof T];

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

export type GetTotalKey<
  T,
  R extends ExtractReducersTypeOnlyModels<T> = ExtractReducersTypeOnlyModels<T>,
  E extends ExtractEffectsTypeOnlyModels<T> = ExtractEffectsTypeOnlyModels<T>,
  RK extends GetKeys<R> = GetKeys<R>,
  EK extends GetKeys<E> = GetKeys<E>
> = RK | EK;

export type SafeDispatch<
  T,
  KM extends {} = {},
  OKM extends keyof KM = keyof KM,
  TK extends GetTotalKey<T> = GetTotalKey<T>,
  MK extends OKM | TK = OKM | TK,
  P extends KeyValueTupleToObject<GetMergedPayload<T>> = KeyValueTupleToObject<
    GetMergedPayload<T>
  >
> = <A extends MK = MK>(
  action: SafeAction<MK, P, A> | Array<SafeAction<MK, P, void>>
) => void;
// (<A1 extends any>(
//     action: SafeAction<MK, P, A1>
//   ) => void) |
// (<A1, A2>(
//     action: [SafeAction<MK, P, A1>, SafeAction<MK, P, A2>]
//   ) => void) |
// (<A1, A2, A3>(
//   action: [
//     SafeAction<MK, P, A1>,
//     SafeAction<MK, P, A2>,
//     SafeAction<MK, P, A3>,
//   ]
// ) => void)

//   export type SafeDispatch<
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

// export type SafeDispatch<
//   T,
//   KM extends {} = {},
//   OKM extends keyof KM = keyof KM,
//   TK extends GetTotalKey<T> = GetTotalKey<T>,
//   MK extends OKM | TK = OKM | TK,
//   P extends KeyValueTupleToObject<GetMergedPayload<T>> = KeyValueTupleToObject<
//     GetMergedPayload<T>
//   >
// > = <
//   A1 extends any = void,
//   A2 extends any = void,
//   A3 extends any = void,
//   A4 extends any = void,
//   A5 extends any = void,
//   A6 extends any = void,
//   A7 extends any = void,
//   A8 extends any = void,
//   A9 extends any = void,
//   A10 extends any = void,
//   A11 extends any = void,
//   A12 extends any = void,
//   A13 extends any = void,
//   A14 extends any = void,
//   A15 extends any = void,
//   A16 extends any = void,
//   A17 extends any = void,
//   A18 extends any = void,
//   A19 extends any = void,
//   A20 extends any = void,
//   A21 extends any = void,
//   A22 extends any = void,
//   A23 extends any = void,
//   A24 extends any = void,
//   A25 extends any = void,
//   A26 extends any = void,
//   A27 extends any = void,
//   A28 extends any = void,
//   A29 extends any = void,
//   A30 extends any = void,
//   A31 extends any = void,
//   A32 extends any = void,
//   A33 extends any = void,
//   A34 extends any = void,
//   A35 extends any = void,
//   A36 extends any = void,
//   A37 extends any = void,
//   A38 extends any = void,
//   A39 extends any = void,
//   A40 extends any = void,
// >(
//   action: SafeAction<MK, P, A1> | [
//     SafeAction<MK, P, A1>,
//     SafeAction<MK, P, A2> | never,
//     SafeAction<MK, P, A3>,
//     SafeAction<MK, P, A4>,
//     SafeAction<MK, P, A5>,
//     SafeAction<MK, P, A6>,
//     SafeAction<MK, P, A7>,
//     SafeAction<MK, P, A8>,
//     SafeAction<MK, P, A9>,
//     SafeAction<MK, P, A10>,
//     SafeAction<MK, P, A11>,
//     SafeAction<MK, P, A12>,
//     SafeAction<MK, P, A13>,
//     SafeAction<MK, P, A14>,
//     SafeAction<MK, P, A15>,
//     SafeAction<MK, P, A16>,
//     SafeAction<MK, P, A17>,
//     SafeAction<MK, P, A18>,
//     SafeAction<MK, P, A19>,
//     SafeAction<MK, P, A20>,
//     SafeAction<MK, P, A21>,
//     SafeAction<MK, P, A22>,
//     SafeAction<MK, P, A23>,
//     SafeAction<MK, P, A24>,
//     SafeAction<MK, P, A25>,
//     SafeAction<MK, P, A26>,
//     SafeAction<MK, P, A27>,
//     SafeAction<MK, P, A28>,
//     SafeAction<MK, P, A29>,
//     SafeAction<MK, P, A30>,
//     SafeAction<MK, P, A31>,
//     SafeAction<MK, P, A32>,
//     SafeAction<MK, P, A33>,
//     SafeAction<MK, P, A34>,
//     SafeAction<MK, P, A35>,
//     SafeAction<MK, P, A36>,
//     SafeAction<MK, P, A37>,
//     SafeAction<MK, P, A38>,
//     SafeAction<MK, P, A39>,
//     SafeAction<MK, P, A40>,
//   ]
// ) => void;

export type SafeAction<T, P, A> = {
  // If A is assigned with a value, type should be same as A
  type: A extends string ? A : T;
  // payload?: T extends keyof P ? P[T] : never;
  payload?: A extends string
    ? A extends keyof P
      ? P[A]
      : never
    : T extends keyof P
    ? P[T]
    : never;
};
