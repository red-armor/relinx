import { TrackerProxy } from '../tracker/types';
import { SafeDispatch } from './createStore';

export type UseRelinxReturnValue<T> = [TrackerProxy, SafeDispatch<T>];
export type UseRelinx = <T>(storeName: string) => UseRelinxReturnValue<T>;
