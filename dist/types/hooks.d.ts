import { TrackerProxy } from '../tracker/types';
import { SafeDispatch } from './createStore';
export declare type UseRelinxReturnValue<T> = [TrackerProxy, SafeDispatch<T>];
export declare type UseRelinx = <T>(storeName: string) => UseRelinxReturnValue<T>;
