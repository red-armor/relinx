import { CSSProperties } from 'react'
import { ContainerModel } from './container'
import { BottomBarModel } from './bottomBar'
import { GoodsViewModel } from './goodsView'
import { GetMergedPayload, MergedP, KeyValueTupleToObject, SafeAction, GetTotalKey, EffectPayload, ExtractEffectsTypeOnlyModels, ReducerPayload } from '../../src/types'

export interface Styles {
  [key: string]: CSSProperties
}

export * from './container'

type modelKeys = 'init' | 'bottomBar' | 'goods'

export type Models = {
  'goods': GoodsViewModel,
  'bottomBar': BottomBarModel,
  'init': ContainerModel,
    // key extends 'init' ? ContainerModel :
    // key extends 'bottomBar' ? BottomBarModel : never
}
// export type Models = {
//   [key in modelKeys]: key extends 'init' ? ContainerModel :
//     key extends 'bottomBar' ? BottomBarModel :
//     key extends 'goods' ? GoodsViewModel : never
// }

type x = unknown extends unknown ? string : number

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

/**
 * The following may help to find safe dispatch not work issue
 *
 *
 * type OKM = keyof KeyMap
 * type TK = GetTotalKey<Models>
 * type MK = OKM | TK
 * type T  = GetMergedPayload<Models>
 * type R = ExtractReducersTypeOnlyModels<Models>
 * type E = ExtractEffectsTypeOnlyModels<Models>
 *
 * type RK = GetKeys<R>
 * type EK = GetKeys<E>
 * type RP = ReducerPayload<R>
 * type EP = EffectPayload<E>
 * type Merged = GetMergedPayload<Models>
 *
 * type PPP = unknown extends any ? string : number
 *
 * type KW = never | unknown
 *
 * type P1 = KeyValueTupleToObject<GetMergedPayload<Models>>
 */

// type OKM = keyof KeyMap
// type TK = GetTotalKey<Models>
// type MK = OKM | TK
// type T  = GetMergedPayload<Models>
// // type P1 = KeyValueTupleToObject<T>
// type R = ExtractReducersTypeOnlyModels<Models>
// type E = ExtractEffectsTypeOnlyModels<Models>
// type RK = GetKeys<R>
// type EK = GetKeys<E>
// type RP = ReducerPayload<R>
// type EP = EffectPayload<E>
// type Merged = GetMergedPayload<Models>
// type PPP = unknown extends any ? string : number
// type KW = never | unknown
// type P1 = KeyValueTupleToObject<GetMergedPayload<Models>>

// type P1 = KeyValueTupleToObject<GetMergedPayload<Models>>
// type Payload = GetMergedPayload<Models>
// type N = MergedP<KeyMap, P1>

// type X1 = SafeAction<Models, N, 'goods/increment'>
// type X2 = SafeAction<Models, N, 'init/getGoodsList'>

// type X3 = EffectPayload<ExtractEffectsTypeOnlyModels<Models>>


// type Y = unknown extends number ? number : string
// type XX = {a: number} extends unknown ? number : string