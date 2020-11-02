// @ts-nocheck
import shallowEqual from '../../src/utils/shallowEqual'

describe('ifType', () => {
    test('shallowEqual', () => {

        const objA = {
            "name": 'huang',
            "age": 123,
        }

        const objB = {
            "name": 'huang',
            "age": 123,
        }

        const objC = {
            "name": 'huang',
        }
        Object.defineProperty(objC, "age", {
            value: 123,
            writable: false,
            enumerable: false,
            configurable: false 
          });

        expect(shallowEqual(objA, objB)).toBe(true)
        expect(shallowEqual(objA, objC)).toBe(false)
    });
})