import { CreateStoreOnlyModels, EnhanceFunction, BasicModelType, CreateStoreResult } from './types';
export default function createStore<T extends BasicModelType<T>, MODEL_KEY extends keyof T = keyof T>(configs: {
    models: CreateStoreOnlyModels<T>;
    initialValue?: {
        [key in MODEL_KEY]?: any;
    };
}, enhancer?: EnhanceFunction): CreateStoreResult<T>;
