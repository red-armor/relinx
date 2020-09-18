import { TrackerProxy } from '../tracker/types';
import { SafeDispatch } from './createStore';
export declare type UseRelinxReturnValue<T, M> = [TrackerProxy, SafeDispatch<T, M>];
export declare type UseRelinx = <T, M>(storeName: string) => UseRelinxReturnValue<T, M>;
