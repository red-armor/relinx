import { CSSProperties } from 'react'
import { ContainerModel } from './container'
import { BottomBarModel } from './bottomBar'
import { GoodsViewModel } from './goodsView'

export interface Styles {
  [key: string]: CSSProperties
}

export * from './container'

type modelKeys = 'init' | 'bottomBar' | 'goods'

export type Models = {
  [key in modelKeys]: key extends 'init' ? ContainerModel :
    key extends 'bottomBar' ? BottomBarModel :
    key extends 'goods' ? GoodsViewModel : never
}

export type KeyMap = {
  'init/updateState': 'updateState',
  'init/updatePage': 'updatePage',
  'init/updateOnline': 'updateOnline',
  'init/getGoodsList': 'getGoodsList',

  'goods/addGoods': 'addGoods',
  'goods/incrementItemCount': 'incrementItemCount',
  'goods/decrementItemCount': 'decrementItemCount',
  'goods/increment': 'increment',
  'goods/decrement': 'decrement',

  'bottomBar/incrementTotalCount': 'incrementTotalCount',
  'bottomBar/decrementTotalCount': 'decrementTotalCount'
}