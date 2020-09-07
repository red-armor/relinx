export declare const emptyFunction: () => void;
export declare const isObject: (o: any) => boolean;
export declare const hasSymbol: boolean;
export declare const TRACKER: unique symbol;
export declare const canIUseProxy: () => boolean;
export declare const hasOwnProperty: (o: object, prop: PropertyKey) => boolean;
export declare const isTrackable: (o: any) => boolean;
declare type EachArray<T> = (index: number, entry: any, obj: T) => void;
declare type EachObject<T> = <K extends keyof T>(key: K, entry: T[K], obj: T) => number;
declare type Iter<T extends Array<any> | {
    [key: string]: any;
}> = T extends Array<any> ? EachArray<T> : T extends {
    [key: string]: any;
} ? EachObject<T> : never;
export declare function each<T>(obj: T, iter: Iter<T>): void;
export declare const Type: {
    Object: string;
    Array: string;
};
export declare function shallowCopy(o: any): any;
export declare const inherit: (subClass: {
    prototype: any;
}, superClass: {
    prototype: any;
}) => void;
export declare const createHiddenProperty: (target: object, prop: PropertyKey, value: any) => void;
export declare const hideProperty: (target: object, prop: PropertyKey) => void;
export {};
