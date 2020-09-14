export declare type Subscription<T> = ({ oldState, newState, diff, }: {
    oldState: T;
    newState: T;
    diff: Partial<T>;
}) => any;
