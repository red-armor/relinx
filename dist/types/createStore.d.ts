export interface Action {
    type: string;
    payload?: object;
}
export declare type ModelKey = 'state' | 'reducers' | 'effects';
export declare type BasicModelType<T> = {
    [key in keyof T]: {
        [key in ModelKey]: any;
    };
};
export declare type CreateStoreResult<T, GLOBAL_STATE extends ExtractStateTypeOnlyModels<T> = ExtractStateTypeOnlyModels<T>, GLOBAL_REDUCERS extends ExtractReducersTypeOnlyModels<T> = ExtractReducersTypeOnlyModels<T>, GLOBAL_EFFECTS extends ExtractEffectsTypeOnlyModels<T> = ExtractEffectsTypeOnlyModels<T>> = {
    initialState: GLOBAL_STATE;
    reducers: GLOBAL_REDUCERS;
    effects: GLOBAL_EFFECTS;
    createReducer: any;
};
export declare type CreateStoreFn<T extends BasicModelType<T>, K extends keyof T = keyof T> = (configs: {
    models: CreateStoreOnlyModels<T>;
    initialValue?: {
        [key in K]?: any;
    };
}) => CreateStoreResult<T>;
export declare type CreateStore<T = any> = {
    [key in keyof T]: key extends 'models' ? T[key] extends object ? {
        [modelKey in keyof T[key]]: T[key] extends object ? CreateStore<T[key][modelKey]> : T[key];
    } : T[key] : key extends 'reducers' ? {
        [reducerKey in keyof T[key]]: (state: any, payload?: any) => any;
    } : key extends 'state' ? {
        [stateKey in keyof T[key]]: any;
    } : key extends 'effects' ? {
        [effectKey in keyof T[key]]: (payload: any) => (dispatch: number, getState?: any) => void;
    } : never;
};
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
        [key in keyof T[modelKey]]: key extends 'state' ? {
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
    [key in keyof K]: T[K];
};
export interface ChangedValueGroup {
    storeKey: string;
    changedValue: object;
}
export declare type RR<R, M extends keyof R> = {
    [key in M]: {
        [k: string]: (state: {
            [stateKey: string]: any;
        }, payload?: any) => any;
    };
};
export declare type SS<T, K extends keyof T> = {
    [key in K]: {
        [k: string]: any;
    };
};
export interface CombineReducersReducer1 {
    <T, K extends keyof T>(state: SS<T, K>): CombineReducersReducer2;
}
export interface CombineReducersReducer2 {
    (_: any, actions: Array<Action>): Array<any>;
}
export {};
