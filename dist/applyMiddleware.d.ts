import { BasicModelType, CreateStoreFn, CreateStoreOnlyModels, Middleware, Dispatch } from './types';
export default function applyMiddleware(...middleware: Array<Middleware>): <T extends BasicModelType<T>>(createStore: CreateStoreFn<T, keyof T>) => (config: {
    models: CreateStoreOnlyModels<T, import("./types").ExtractStateTypeOnlyModels<T>>;
    initialValue?: { [key in keyof T]?: any; } | undefined;
}) => {
    createDispatch: (setValue: Function) => Dispatch;
    dispatch: Dispatch;
    initialState: import("./types").ExtractStateTypeOnlyModels<T>;
    reducers: import("./types").ExtractReducersTypeOnlyModels<T>;
    effects: import("./types").ExtractEffectsTypeOnlyModels<T>;
    createReducer: any;
};
