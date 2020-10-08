import { AttachStoreName } from './';
import { Dispatch } from './createStore';
import Application from '../Application';
import Patcher from '../Patcher';
export interface ContextDefaultValue<T, M> {
    computation: null;
    dispatch: Dispatch<T, M>;
    attachStoreName: AttachStoreName;
    application: null | Application<any, any>;
    useProxy: boolean;
    useScope: boolean;
    namespace: null | string;
    patcher: null | Patcher;
    useRelinkMode: boolean;
    componentName?: string;
}
