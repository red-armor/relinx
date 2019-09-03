import address from './address'
import user from './user'

import { combineModels } from 'relinx'

export default combineModels({
  address,
  user,
})
