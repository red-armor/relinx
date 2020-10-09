// @ts-nocheck
import ReactTestUtils from 'react-dom/test-utils'; 
import {
    applyMiddleware,
    thunk,
    logger,
    createStore
} from '../src/index'
import Models from '../examples/basic/models'
import { $$observable } from './basic/util'

describe('applyMiddleware', () => {
    it('初始化', () => {
        const store = applyMiddleware(thunk, logger)(createStore)({models: new Models()})
        ReactTestUtils.act(() => {
            store.dispatch({
                type: 'init/updateOnline',
            })
        })
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
})