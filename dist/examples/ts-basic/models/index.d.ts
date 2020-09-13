declare const _default: () => {
    init: {
        state: {
            page: number;
            status: string;
        };
        reducers: {
            updateState: (_: any, { status }: {
                status: any;
            }) => {
                status: any;
            };
            updatePage: (state: any) => {
                page: any;
            };
        };
        effects: {
            getGoodsList: () => (dispatch: any, getState: any) => void;
            updateOnline: () => (dispatch: any) => void;
        };
    };
    goods: {
        state: {
            listData: never[];
        };
        reducers: {
            addGoods(state: any, { goodsList }: {
                goodsList: any;
            }): {
                listData: never[];
            };
            incrementItemCount(state: any, { id, index }: {
                id: any;
                index: any;
            }): {
                listData: any[];
            };
            decrementItemCount(state: any, { id, index }: {
                id: any;
                index: any;
            }): {
                listData: any[];
            };
        };
        effects: {
            increment: ({ id, index }: {
                id: any;
                index: any;
            }) => (dispatch: any) => void;
            decrement: ({ id, index }: {
                id: any;
                index: any;
            }) => (dispatch: any) => void;
        };
    };
    bottomBar: {
        state: {
            count: number;
        };
        reducers: {
            incrementTotalCount(state: any): {
                count: any;
            };
            decrementTotalCount(state: any): {
                count: number;
            };
        };
    };
};
export default _default;
