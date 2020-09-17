/// <reference types="react" />
import { ContextDefaultValue } from './types';
export declare const defaultValue: {
    computation: null;
    getData: () => {
        trackerNode: null;
    };
    dispatch: () => void;
    attachStoreName: () => void;
    useProxy: boolean;
    namespace: null;
    patcher: null;
    trackerNode: null;
    useRelinkMode: boolean;
    application: null;
};
declare const _default: import("react").Context<ContextDefaultValue<any>>;
export default _default;
