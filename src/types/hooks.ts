import { TrackerProxy } from '../tracker/types';
import { Dispatch } from './';

export type UseRelinxReturnValue = [TrackerProxy, Dispatch];
export type UseRelinx = (storeName: string) => UseRelinxReturnValue;
