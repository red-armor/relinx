import Store from '../Store';
export interface Action {
    type: string;
    payload?: object;
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
            [reducerKey in keyof T[modelKey][key]]: (state: S[modelKey], payload: any) => void;
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
export {};
