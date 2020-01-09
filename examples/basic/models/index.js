import init from './init'
import goods from './goods'
import bottomBar from './bottomBar'

export default () => ({
  init: new init(),
  goods: new goods(),
  bottomBar: new bottomBar(),
})
