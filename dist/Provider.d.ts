/// <reference types="react" />
import { ProviderProps, BasicModelType } from './types';
declare function Provider<T extends BasicModelType<T>, K extends keyof T = keyof T>({ store, children, namespace, useProxy, useRelinkMode, strictMode, }: ProviderProps<T>): JSX.Element;
export default Provider;
