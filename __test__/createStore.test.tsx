// @ts-nocheck
import React from 'react';
import Renderer from 'react-test-renderer';
import ReactTestUtils from 'react-dom/test-utils'; 
import {
    createStore,
    applyMiddleware,
    thunk,
    Provider,
} from '../src/index'
import Models from '../examples/basic/models'
import App from './basic/views'
import Store from '../src/Store'
import { getStatusValue } from './basic/stateUtil'
import { $$observable } from './basic/util'

describe('createStore', () => {
    it('public API 验证', () => {
        const store = createStore({
            models: new Models(),
        }, applyMiddleware(thunk))

        const methods = Object.keys(store).filter(key => key !== $$observable)


        expect(methods.length).toBe(9)
        expect(methods).toContain('_state')
        expect(methods).toContain('_reducers')
        expect(methods).toContain('_effects')
        expect(methods).toContain('_pendingActions')
        expect(methods).toContain('_pendingAutoRunInitializations')
        expect(methods).toContain('dispatch')
        expect(methods).toContain('_application')
        expect(methods).toContain('subscriptions')
        expect(methods).toContain('_count')
        expect(store._count).toBe(0)
    })

    it('createStore 异常场景验证', () => {
        expect(() => createStore(undefined)).toThrow()

        expect(() => createStore(('test' as unknown))).toThrow()

        expect(() => createStore(({} as unknown))).toThrow()

    })

    it('init State 验证', () => {
        const listData = []
        for (let index = 0; index < 10; index++) {
            listData.push({ id: index, index })
        }
        const initData = {
            init: {
                page: 0,
                status: 'online',
            },
            goods: {
                listData,
                bottomBarUpdateCount: 0,
                listLength: listData.length,
            },
            bottomBar: {
                count: 0,
            },
        }

        const store = createStore({
            models: new Models(),
            initialValue: initData
        }, applyMiddleware(thunk))

        expect(store).toBeInstanceOf(Store)
        expect(store.getState()).toEqual(initData)

    })

    it('store.dispatch 验证', () => {
        const store = createStore({
            models: new Models()
        }, applyMiddleware(thunk))

        const Subject = () => (
            <Provider store={store} >
                <App />
            </Provider>)
        Renderer.create(<Subject />)

        const offlineValue = getStatusValue(store.getState())
        expect(offlineValue).toEqual('offline')
        ReactTestUtils.act(() => {
            store.dispatch({
                type: 'init/updateOnline',
            })
        })
        const onlineValue = getStatusValue(store.getState())
        expect(onlineValue).toEqual('online')
    })
})