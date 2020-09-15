export type Subscription<T> = ({
  oldState,
  newState,
  diff,
}: {
  oldState: T;
  newState: T;
  diff: Partial<T>;
}) => any;

// export interface Subscription<T> {
//   ({ oldState, newState, diff }: { oldState: T; newState: T; diff: Partial<T> }): any;
// }
