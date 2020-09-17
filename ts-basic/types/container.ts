export interface ContainerState {
  page: number;
  status: string;
}

export interface ContainerModel {
  state: {
    page: number;
    status: string;
  },
  reducers: {
    updateState: (state: any, payload: { status: string }) => any,
    updatePage: (state: any, payload: { status: string }) => any,
  },
  effects: {
    // getGoodsList: () => (dispatch: Function, getState: Function) => any,
    // updateOnline: () => (dispatch: Function, getState: Function) => any,
  }
}