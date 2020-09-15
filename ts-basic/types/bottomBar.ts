export interface BottomBarModel {
  state: { count: number },
  reducers: {
    incrementTotalCount: () => any
    decrementTotalCount: () => any
  }
}