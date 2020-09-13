import Application from './Application';
import { Action, Dispatch, Subscription, BasicModelType, CreateStoreOnlyModels, ExtractStateTypeOnlyModels, ExtractEffectsTypeOnlyModels, ExtractReducersTypeOnlyModels } from './types';
declare class Store<T extends BasicModelType<T>, MODEL_KEY extends keyof T = keyof T> {
    private _application;
    private _count;
    dispatch: Dispatch;
    private _state;
    private _reducers;
    private _effects;
    initialState: any;
    subscriptions: {
        [key: string]: Function;
    };
    constructor(configs: {
        models: CreateStoreOnlyModels<T>;
        initialValue?: {
            [key in MODEL_KEY]?: any;
        };
    });
    getState(): ExtractStateTypeOnlyModels<T>;
    getReducers(): ExtractReducersTypeOnlyModels<T>;
    getEffects(): ExtractEffectsTypeOnlyModels<T>;
    setValue(actions: Array<Action>): void;
    bindApplication(application: Application<T, MODEL_KEY>): void;
    decorateDispatch(chainedMiddleware: Function): void;
    generateSubscriptionKey(): string;
    subscribe(subscription: Subscription): () => boolean;
    injectModel(key: MODEL_KEY, model: any, initialValue?: any): void;
}
export default Store;
