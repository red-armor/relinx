import { FilterTypes }from '../../constants'

export default () => ({
  state: { filter: FilterTypes.ALL },
  reducers: {
    setFilter: (state, { filter }) => ({filter}),
  }
})
