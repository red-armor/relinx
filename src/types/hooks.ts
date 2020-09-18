import { TrackerProxy } from '../tracker/types';
import { SafeDispatch } from './createStore';

export type UseRelinxReturnValue<T, M> = [TrackerProxy, SafeDispatch<T, M>];
export type UseRelinx = <T, M>(storeName: string) => UseRelinxReturnValue<T, M>;
