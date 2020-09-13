declare const _default: () => {
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
export default _default;
