import { GetData, AttachStoreName } from './';
import { Dispatch } from './createStore';
import Application from '../Application';
import Patcher from '../Patcher';
import { TrackerNode } from '../tracker/types';
export interface ContextDefaultValue<T, M> {
    computation: null;
    dispatch: Dispatch<T, M>;
    getData: GetData;
    attachStoreName: AttachStoreName;
    application: null | Application<any, any>;
    useProxy: boolean;
    namespace: null | string;
    patcher: null | Patcher;
    trackerNode: null | TrackerNode;
    useRelinkMode: boolean;
}
