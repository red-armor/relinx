export declare const goodsDataGenerator: ({ page }: {
    page: any;
}) => {
    id: number;
    title: string;
    count: number;
    description: string;
}[];
export declare const getGoods: ({ page }: {
    page: any;
}) => Promise<unknown>;
