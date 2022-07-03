import React, { useCallback, useEffect } from 'react'
import { observe, useDispatch } from 'relinx'
import { produce, StateTrackerUtil, observer } from 'state-tracker'

import BottomBar from '../../views/bottom-bar'
import GoodsView from '../../views/goods'
import LoadMore from '../../views/load-more'

const styles = {
  body: {
    width: '100%',
    height: '100%',
  },

  simulator: {
    paddingTop: 15,
    paddingBottom: 50,
    width: 375,
    height: 667,
    backgroundColor: '#fff',
    marginTop: 50,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 20,
    position: 'relative',
    border: '1px solid #000',
    boxSizing: 'border-box',
    display: 'flex',
  },
  goodsWrapper: {
    overflowY: 'auto',
    flex: 1,
  },

  updateButton: {
    position: 'absolute',
    bottom: 100,
    right: 10,
    width: 80,
    height: 80,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  updateButtonText: {

  }
}

const ActionButtons = props => {
  const [dispatch] = useDispatch()
  const onClick = useCallback(() => {
    dispatch({
      type: 'goods/pumpData'
    })
  }, [])

  return (
    <button onClick={onClick} style={styles.updateButton}>update</button>
  )
}

const Main = () => {
  const [dispatch] = useDispatch()

  useEffect(() => {
    dispatch([{
      type: 'init/updateOnline',
    }, {
      type: 'goods/getGoodsList',
    }])

  }, [])

  // const state = {
  //   app: {
  //     list: [
  //       { id: 1, label: 'first' },
  //       { id: 2, label: 'second' },
  //     ],
  //   },
  // };

  // const proxyState = produce(state);
  // let runCount = 0;

  // // @ts-ignore
  // const fn = observer(
  //   proxyState,
  //   // @ts-ignore
  //   (state) => {
  //     const { app } = state;
  //     runCount++;
  //     app.list.forEach((item) => {
  //       const { id } = item;
  //       return `${id}`;
  //     });
  //   },
  // );

  // fn();

  // return null

  // const state = {};
  // const a = Object.defineProperty({}, 'current', {
  //   writable: true,
  //   configurable: true,
  //   value: 3,
  // });
  // Object.defineProperty(state, 'a', {
  //   writable: true,
  //   configurable: true,
  //   value: a,
  // });

  // // @ts-ignore
  // Object.preventExtensions(state.a);

  // const proxyState = produce(state);
  // console.log('proxyState.a.current ', proxyState.a.current)
  // console.log("proxyState.a ", proxyState.a)

  // const state = {
  //   a: {
  //     a1: [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }],
  //   },
  // };

  // const proxyState = produce(state);
  // StateTrackerUtil.enter(proxyState, 'list');

  // const trackerList = proxyState.a.a1.map(
  //   item => StateTrackerUtil.getTracker(item)._id
  // );
  // StateTrackerUtil.leave(proxyState);

  // console.log('trackerList ' , trackerList, proxyState)

  // return null
  // const list = [...proxyState.a.a1];
  // list[2] = { ...list[2] };


  // let nextA = {
  //   ...proxyState.a,
  //   a1: list,
  // };
  // StateTrackerUtil.perform(
  //   proxyState,
  //   { a: nextA },
  //   {
  //     afterCallback: () => (proxyState.a = nextA),
  //     stateCompareLevel: 1,
  //   }
  // );

  // StateTrackerUtil.enter(proxyState, 'list');

  // const nextTrackerList = proxyState.a.a1.map(
  //   item => StateTrackerUtil.getTracker(item)._id
  // );
  // StateTrackerUtil.leave(proxyState);

  // console.log('nextTrackerList ' , nextTrackerList, proxyState)



  // return null

  return (
    <div style={styles.body}>
      <div style={styles.simulator}>
        <div style={styles.goodsWrapper}>
          <GoodsView />
          <LoadMore />
          <ActionButtons />
        </div>
        <BottomBar />
      </div>
    </div>
  )
}

export default observe(Main)