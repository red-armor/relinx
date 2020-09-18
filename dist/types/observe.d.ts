import { TrackerNode } from '../tracker/types';
export interface GetData {
    (): {
        trackerNode: TrackerNode | null;
    };
}
export declare type AttachStoreName = (storeName: string) => void;
