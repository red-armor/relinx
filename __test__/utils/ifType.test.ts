// @ts-nocheck

import {isStrictEmptyArray, hasEmptyItem, isStrictEmptyObject, isPresent} from '../../src/utils/ifType'



describe('ifType', () => {
    test('isStrictEmptyArray', () => {
        expect(isStrictEmptyArray(null)).toBe(false)
        expect(isStrictEmptyArray(undefined)).toBe(false)
        expect(isStrictEmptyArray('string')).toBe(false)
        expect(isStrictEmptyArray(function (){})).toBe(false)
        expect(isStrictEmptyArray({})).toBe(false)
        expect(isStrictEmptyArray(['ar'])).toBe(false)
        expect(isStrictEmptyArray([])).toBe(true)
    });

    test('isStrictEmptyObject', () => {
        expect(isStrictEmptyObject(null)).toBe(false)
        expect(isStrictEmptyObject(undefined)).toBe(false)
        expect(isStrictEmptyObject('string')).toBe(false)
        expect(isStrictEmptyObject(function (){})).toBe(false)
        expect(isStrictEmptyObject(['ar'])).toBe(false)
        expect(isStrictEmptyObject([])).toBe(false)
        expect(isStrictEmptyObject({name: '123'})).toBe(false)
        expect(isStrictEmptyObject({})).toBe(true)
    });

    test('hasEmptyItem', () => {
        expect(hasEmptyItem(null)).toBe(false)
        expect(hasEmptyItem(undefined)).toBe(false)
        expect(hasEmptyItem('string')).toBe(false)
        expect(hasEmptyItem(function (){})).toBe(false)
        expect(hasEmptyItem(['ar'])).toBe(false)
        expect(hasEmptyItem()).toBe(false)
        expect(hasEmptyItem([])).toBe(true)
        expect(hasEmptyItem({})).toBe(true)
    });


    test('isPresent', () => {
        expect(isPresent(null)).toBe(true)
        expect(isPresent('string')).toBe(true)
        expect(isPresent(function (){})).toBe(true)
        expect(isPresent(['ar'])).toBe(true)
        expect(isPresent()).toBe(false)
        expect(isPresent(undefined)).toBe(false)
    });
});