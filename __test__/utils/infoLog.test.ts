// @ts-nocheck
import infoLog from '../../src/utils/infoLog'

function LogEach(items, callback) {
    for (const item of items) {
        callback(item);
    }
}

describe('infoLog', () => {
    test('infoLog 方法执行', () => {
        expect.assertions(1);
        const infoLogCallback = jest.fn((...args) => infoLog(args));
        const list = [null, undefined, 'string',['arr1', 'arr2']]
        LogEach(list, infoLogCallback);
        expect(infoLogCallback).toHaveBeenCalledTimes(4);
    });
});