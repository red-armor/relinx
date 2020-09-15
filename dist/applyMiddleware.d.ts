import { BasicModelType, CreateStoreFn, CreateStoreOnlyModels, Middleware } from './types';
export default function applyMiddleware(...middleware: Array<Middleware>): <T extends BasicModelType<T>>(createStore: CreateStoreFn<T, keyof T>) => (config: {
    models: CreateStoreOnlyModels<T, import("./types").ExtractStateTypeOnlyModels<T>>;
    initialValue?: { [key in keyof T]?: any; } | undefined;
}) => import("./Store").default<T, keyof T>;
