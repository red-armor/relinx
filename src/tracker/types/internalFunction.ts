import { IProxyTracker, IES5Tracker } from './';
export interface InternalFunction {
  reportAccessPath(path: Array<string>): void;
  cleanup(): void;
  unlink(): void;
  relink(path: Array<string>, baseValue: object): void;
  relinkProp(prop: string, newValue: object): void;
  relinkBase(baseValue: object): void;
  rebase(baseValue: object): void;
  setRemarkable(): boolean;
  getRemarkableFullPaths(): Array<Array<string>>;
  assertScope(): void;
}

export interface PropProperty {
  path: Array<string>;
  source: IProxyTracker | IES5Tracker | null;
}
