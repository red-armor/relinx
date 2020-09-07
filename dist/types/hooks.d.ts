import { TrackerProxy } from '../tracker/types';
import { Dispatch } from './';
export declare type UseRelinxReturnValue = [TrackerProxy, Dispatch];
export declare type UseRelinx = (storeName: string) => UseRelinxReturnValue;
