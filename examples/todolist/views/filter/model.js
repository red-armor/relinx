import { FilterTypes }from '../../util/commons'

export default () => ({
  state: { filter: FilterTypes.ALL },
  reducers: {
    setFilter: (state, { filter }) => ({filter}),
  }
})
