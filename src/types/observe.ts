import { TrackerNode } from '../tracker/types';

export interface GetData {
  (): {
    trackerNode: TrackerNode;
  };
}

export type AttachStoreName = (storeName: string) => void;
