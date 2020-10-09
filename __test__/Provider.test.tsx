// @ts-nocheck
import 'jsdom-global/register';
import React from 'react';
import Renderer from 'react-test-renderer';
import ReactTestUtils from 'react-dom/test-utils'; 
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
import { getGoods } from '../examples/basic/data-source/goods'
import { getGoodsViewSpan, getGoodsItems, getGoodsItemsFiveTitle } from './basic/domUtil'
import { getListLengthValue, getGoodsItemsFiveValue } from './basic/stateUtil'

describe('Provider', () => {
    it('保存上一次执行的 snapshot', () => {
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


    it('验证 Provider 的各种功能', async () => {
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


        await ReactTestUtils.act(async () => {
            const { init: { page } } = store.getState()
            const result = await getGoods({ page })
            store.dispatch([{
                type: 'goods/addGoods',
                payload: {
                    goodsList: result,
                },
            }, {
                type: 'init/updatePage',
            }])
            return
        })
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
});