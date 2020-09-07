import { TrackerNode } from '../tracker/types';
export interface GetData {
    (): {
        trackerNode: TrackerNode;
    };
}
export declare type AttachStoreName = (storeName: string) => void;
