import Store from '../Store';
export interface Action {
    type: string;
    payload?: any;
}
export declare type ModelKey = 'state' | 'reducers' | 'effects';
export declare type BasicModelType<T> = {
    [key in keyof T]: {
        state: any;
        reducers?: any;
        effects?: any;
    };
};
export declare type CreateStoreFn<T extends BasicModelType<T>, K extends keyof T = keyof T> = (configs: {
    models: CreateStoreOnlyModels<T>;
    initialValue?: {
        [key in K]?: any;
    };
}) => Store<T>;
declare type ExtractKey<T, key, K extends keyof T = keyof T> = K extends key ? T[K] : never;
declare type ExtractModelType<T> = ExtractKey<T, 'models'>;
export declare type ExtractStateType<T, Models extends ExtractModelType<T> = ExtractModelType<T>> = {
    [key in keyof Models]: ExtractKey<Models[key], 'state'>;
};
export declare type ExtractReducersType<T, Models extends ExtractModelType<T> = ExtractModelType<T>> = {
    [key in keyof Models]: ExtractKey<Models[key], 'reducers'>;
};
export declare type CreateStoreOnlyModels<T extends BasicModelType<T>, S extends ExtractStateTypeOnlyModels<T> = ExtractStateTypeOnlyModels<T>> = {
    [modelKey in keyof T]: {
        [key in keyof T[modelKey]]?: key extends 'state' ? {
            [stateKey in keyof T[modelKey][key]]: T[modelKey][key][stateKey];
        } : key extends 'reducers' ? {
            [reducerKey in keyof T[modelKey][key]]: (state: S[modelKey], payload: any) => Partial<S[modelKey]>;
        } : key extends 'effects' ? {
            [effectKey in keyof T[modelKey][key]]: (payload: any) => (dispatch: Function, getState: () => S) => void;
        } : never;
    };
};
export declare type ExtractStateTypeOnlyModels<Models> = {
    [key in keyof Models]: ExtractKey<Models[key], 'state'>;
};
export declare type ExtractReducersTypeOnlyModels<Models> = {
    [key in keyof Models]: ExtractKey<Models[key], 'reducers'>;
};
export declare type ExtractEffectsTypeOnlyModels<Models> = {
    [key in keyof Models]: ExtractKey<Models[key], 'effects'>;
};
export declare type GenericState<T, K extends keyof T> = {
    [key in keyof T]: T[K];
};
export interface ChangedValueGroup<K> {
    storeKey: K;
    changedValue: object;
}
declare type GetReducerPayload<T> = T extends (S: any) => object ? never : T extends (S: any, payload: infer B) => object ? B extends any ? B : never : never;
declare type GetEffectPayload<T> = T extends (payload?: infer B) => (dispatch?: Function, getState?: Function) => void ? B : never;
declare type KeyValueTupleToObject<T extends [keyof any, any]> = {
    [K in T[0]]: Extract<T, [K, any]>[1];
};
declare type GetKeys<T> = {
    [key in keyof T]: keyof T[key] extends string ? keyof T[key] : never;
}[keyof T];
declare type ReducerPayload<R> = {
    [key in keyof R]: {
        [k in keyof R[key]]: [k, GetReducerPayload<R[key][k]>];
    }[keyof R[key]];
}[keyof R];
declare type EffectPayload<E> = {
    [key in keyof E]: E[key] extends never ? never : {
        [k in keyof E[key]]: [k, GetEffectPayload<E[key][k]>];
    }[keyof E[key]];
}[keyof E];
declare type GetMergedPayload<T, R extends ExtractReducersTypeOnlyModels<T> = ExtractReducersTypeOnlyModels<T>, E extends ExtractEffectsTypeOnlyModels<T> = ExtractEffectsTypeOnlyModels<T>, RP extends ReducerPayload<R> = ReducerPayload<R>, EP extends EffectPayload<E> = EffectPayload<E>> = RP | EP;
declare type GetTotalKey<T, R extends ExtractReducersTypeOnlyModels<T> = ExtractReducersTypeOnlyModels<T>, E extends ExtractEffectsTypeOnlyModels<T> = ExtractEffectsTypeOnlyModels<T>, RK extends GetKeys<R> = GetKeys<R>, EK extends GetKeys<E> = GetKeys<E>> = RK | EK;
export declare type SafeDispatch<T, KM extends {} = {}, OKM extends keyof KM = keyof KM, TK extends GetTotalKey<T> = GetTotalKey<T>, MK extends OKM | TK = OKM | TK, P extends KeyValueTupleToObject<GetMergedPayload<T>> = KeyValueTupleToObject<GetMergedPayload<T>>> = (action: SafeAction<MK, P> | Array<SafeAction<MK, P>>) => void;
declare type SafeAction<T, P> = {
    type: T;
    payload?: T extends keyof P ? P[T] : never;
};
export {};
