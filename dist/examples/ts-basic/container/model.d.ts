declare const _default: () => {
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
export default _default;
