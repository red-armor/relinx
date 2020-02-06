import { createES5Tracker } from '../es5'
import { TRACKER } from '../commons'

describe("create es5 tracker", () => {
  test('array: prototype functions works', () => {
    const arr = [{ a: 1 }, { b: 2 }]
    const arrProxy = createES5Tracker(arr)

    arrProxy.forEach((item, index) => {
      if (!index) expect(item).toEqual({ a: 1 })
      if (index === 1) expect(item).toEqual({ b: 2 })
    })

    const arr2 = [1, 2, [3, 4, [5, 6]]];
    const arr2Proxy = createES5Tracker(arr2)
    const flattenArr2 = arr2Proxy.flat()
    expect(flattenArr2).toEqual([1, 2, 3, 4, [5, 6]])
  }),

  test("accessPath", () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3 }
    }

    const tracker = createES5Tracker(base)

    const a = tracker.a
    const b = tracker.b
    const c = tracker.c
    const d = tracker.c.d

    expect(tracker[TRACKER].paths).toEqual([
      ['a'], ['b'], ['c'], ['c'], ['c', 'd']
    ])
  })
})