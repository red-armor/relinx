import TrackerNode from '../TrackerNode';

export { TrackerNode };

// export interface TrackerNode {
//   new (props: TrackerNodeConstructorProps): ITrackerNode
// }

// export interface ITrackerNode {
//   base: object;
//   useRevoke: boolean;
//   useScope: boolean;
//   useProxy: boolean;
//   rootPath: string;
//   parent: null | TrackerNode
//   prevSibling: null | TrackerNode
//   nextSibling: null | TrackerNode
//   id: string;
//   isRevoke: boolean;
//   inScope: boolean;

//   updateParent(): void
//   enterTrackerScope: () => void;
//   enterContext: () => void;
//   leaveContext: () => void;
//   initPrevSibling: () => void;
//   destroy: () => void;
//   contains: (childNode: TrackerNode) => boolean;
//   revokeLastChild: () => void;
//   revokeUntil: (parent: TrackerNode) => boolean;
//   revokeSelf: () => boolean;
//   revoke: () => void
//   hydrate(base: object, config: object): void
// }

export interface TrackerNodeConstructorProps {
  parent: null | TrackerNode;
  isSibling: boolean;
  base: object;
  useRevoke: boolean;
  useScope: boolean;
  useProxy: boolean;
  rootPath: Array<string>;
}

export interface HydrateConfig {
  rootPath?: Array<string>;
}
