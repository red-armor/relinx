import createInit from '../containers/app/model'
import createGoods from '../views/goods/model'
import createBottomBar from '../views/bottom-bar/model'

export default () => ({
  init: createInit(),
  goods: createGoods(),
  bottomBar: createBottomBar(),
})
