import React from 'react'
// @ts-ignore
import { useRelinx, observe, useGlobal, useNamespace } from '../../../src'
import { Styles, Models, KeyMap } from '../../types'
import { ExtractStateTypeOnlyModels, RelinxState
} from '../../../src/types'

const styles: Styles = {
  wrapper: {
    right: 0,
    bottom: 0,
    left: 0,
    height: 50,
    position: 'absolute',
    backgroundColor: '#fff',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderTop: '1px solid #eee',
  },
  text: {
    fontSize: 16,
    lineHeight: '20px',
    marginTop: 15,
    paddingLeft: 15,
    color: 'rgb(230, 48, 48)',
    position: 'relative',
    display: 'block',
  },
}

type S = ExtractStateTypeOnlyModels<Models>['bottomBar']

type P = RelinxState<Models, KeyMap, 'bottomBar'>

const BottomBar = () => {
  const [state, dispatch] = useRelinx<Models, KeyMap, 'bottomBar'>('bottomBar')
  const value = useGlobal()
  const namespace = useNamespace()

  const [collections, globalDispatch] = useGlobal()
  const group = collections.filter(collection => {
    const { namespace: targetNamespace } = collection
    return targetNamespace === namespace
  })

  dispatch({
    type: 'updatePage'
  })


  dispatch({
    type: 'goods/addGoods',
    payload: {
      goodsList: [] as unknown as Array<object>,
    },
  })

  dispatch([{
    type: 'bottomBar/incrementTotalCount',
  }, {
    type: 'increment',
    payload: {
      id: 'x',
      index: 1,
    }
  }, {
    type: 'bottomBar/incrementTotalCount',
  }, {
    type: 'increment',
    payload: {
      id: 'x',
      index: 1,
    }
  }])

  dispatch({
    type: 'bottomBar/decrementTotalCount',
  })

  globalDispatch([{
    namespace: 'address-list',
    actions: [{
      type: 'addressList/setSelectedId',
      payload: 'x',
    }],
  }])

  const { count } = state

  return (
    <div style={styles.wrapper}>
      <span style={styles.text}>
        {`number ${count}`}
      </span>
    </div>
  )
}

export default observe(BottomBar)