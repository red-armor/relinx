import { CSSProperties } from 'react'
import { ContainerModel } from './container'
import { BottomBarModel } from './bottomBar'
import { GoodsViewModel } from './goodsView'

export interface Styles {
  [key: string]: CSSProperties
}

export * from './container'

// export interface Models {
//   [key in 'container']: ContainerMode,
//   // BottomBarModel,
//   // GoodsViewModel
// }

type modelKeys = 'init' | 'bottomBar' | 'goods'

export type Models = {
  [key in modelKeys]: key extends 'init' ? ContainerModel :
    key extends 'bottomBar' ? BottomBarModel :
    key extends 'goods' ? GoodsViewModel : never
}