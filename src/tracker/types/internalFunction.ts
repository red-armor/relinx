export interface InternalFunction {
  reportAccessPath(path: string): void;
  cleanup(): void;
  unlink(): void;
  relink(path: Array<string>, baseValue: object): void;
  relinkProp(prop: string, newValue: object): void;
  relinkBase(baseValue: object): void;
  rebase(baseValue: object): void;
  setRemarkable(): boolean;
  getRemarkableFullPaths(): Array<string>;
  assertScope(): void;
}
