import { GetData, Dispatch, AttachStoreName } from './';
import Application from '../Application';
import Patcher from '../Patcher';
import { TrackerNode } from '../tracker/types';
export interface ContextDefaultValue {
    computation: null;
    dispatch: Dispatch;
    getData?: GetData;
    attachStoreName: AttachStoreName;
    application: null | Application<any, any>;
    useProxy: boolean;
    namespace: null | string;
    patcher: null | Patcher;
    trackerNode?: null | TrackerNode;
    useRelinkMode: boolean;
}
