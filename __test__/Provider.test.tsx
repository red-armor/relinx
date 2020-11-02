// @ts-nocheck
import 'jsdom-global/register';
import React from 'react';
import Renderer from 'react-test-renderer';
import {
    mount,
} from 'enzyme';
import {
    Provider,
    createStore,
    applyMiddleware,
    thunk,
} from '../src/index'
import Models from '../examples/basic/models'
import App from './basic/views'
import BottomBar from './basic/views/BottomBar';
import GoodsView from './basic/views/GoodsView';
import LoadMore from './basic/views/LoadMore';
import { getGoodsViewSpan, getGoodsItems, getGoodsItemsFiveTitle, getStatusSpanTitle } from './basic/domUtil'
import { getListLengthValue, getGoodsItemsFiveValue, getStatusValue } from './basic/stateUtil'
import { sleep, getGoods } from './basic/util'

describe('Provider', () => {
    it('是否正常挂载了 view 层', () => {
        const store = createStore({
            models: new Models(),
        }, applyMiddleware(thunk))

        const Subject = () => (
            <Provider store={store} >
                <App />
            </Provider>)

        const wrapper = mount(<Subject></Subject>);
        expect(wrapper.contains(<BottomBar />)).toBe(true);
        expect(wrapper.contains(<GoodsView />)).toBe(true);
        expect(wrapper.contains(<LoadMore />)).toBe(true);
        expect(wrapper.contains(<App />)).toBe(true);
    });


    it('验证 state 和 view 是否正常绑定', async () => {
        const store = createStore({
            models: new Models(),
        }, applyMiddleware(thunk))
        const Subject = () => (
            <Provider store={store} >
                <App />
            </Provider>)
        const renderDom = Renderer.create(<Subject />)

        let spanDom = getGoodsViewSpan(renderDom)
        let spanDomValue = spanDom.children[0]
        expect(spanDom.type).toEqual('span')
        expect(spanDomValue).toEqual(`bottomBarUpdate 0, length ${getListLengthValue(store.getState())}`)


        const { init: { page } } = store.getState()
        const result = getGoods({ page })
        store.dispatch([{
            type: 'goods/addGoods',
            payload: {
                goodsList: result,
            },
        }, {
            type: 'init/updatePage',
        }])

        const sleepCallback = jest.fn(() => {
            spanDom = getGoodsViewSpan(renderDom)
            spanDomValue = spanDom.children[0]
            expect(spanDom.type).toEqual('span')
            expect(spanDomValue).toEqual(`bottomBarUpdate 0, length ${getListLengthValue(store.getState())}`)

            const goodItems = getGoodsItems(renderDom)
            expect(goodItems.length).toEqual(10)
            const domTitle = getGoodsItemsFiveTitle(goodItems)
            const stateTitle = getGoodsItemsFiveValue(store.getState())
            expect(domTitle).toEqual(stateTitle)
        });
        sleep(sleepCallback)

    });

    it('验证 state 和 view 是否正常绑定 Case2', () => {
        const store = createStore({
            models: new Models(),
        }, applyMiddleware(thunk))
        const Subject = () => (
            <Provider store={store} >
                <App />
            </Provider>)
        const renderDom = Renderer.create(<Subject />)

        // 获取dom里面的值
        const spanTitle = getStatusSpanTitle(renderDom)
        // 获取 state 里面的值
        const statusValue = getStatusValue(store.getState())
        expect(statusValue).toEqual('offline')
        // 比较两者是否相等
        expect(spanTitle).toEqual(statusValue)

        store.dispatch({
            type: 'init/updateOnline',
        })

        const sleepCallback = jest.fn(() => {
            const spanTitleUpdated = getStatusSpanTitle(renderDom)
            const statusValueUpdated = getStatusValue(store.getState())
            expect(statusValueUpdated).toEqual('online')
            expect(spanTitleUpdated).toEqual(statusValueUpdated)
        });
        sleep(sleepCallback)
    });
});