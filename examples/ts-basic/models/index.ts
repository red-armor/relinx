import createInit from '../container/model'
import createGoods from '../views/goods-view/model'
import createBottomBar from '../views/bottom-bar/model'

export default () => ({
  init: createInit(),
  goods: createGoods(),
  bottomBar: createBottomBar(),
})
