import { createTracker } from '../proxy'

describe('create tracker', () => {
  test("access property", () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3 }
    }

    const tracker = createTracker(base)

    expect(tracker.a).toBe(1)
    expect(tracker.b).toBe(2)
    expect(tracker.c.d).toBe(3)
  })

  test("accessPath", () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3 }
    }

    const tracker = createTracker(base)

    const a = tracker.a
    const b = tracker.b
    const c = tracker.c
    const d = tracker.c.d

    expect(tracker.paths).toEqual([
      ['a'], ['b'], ['c'], ['c', 'd']
    ])
  })

  test("accessPath: with spread value", () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3 }
    }

    const tracker = createTracker(base)

    const a = tracker.a
    const b = tracker.b
    const c = tracker.c
    const { d } = c

    expect(tracker.paths).toEqual([
      ['a'], ['b'], ['c'], ['c', 'd']
    ])
  })

  test("accessPath: with spread value 2", () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3, h: 5 },
      e: { f: 4 },
    }

    const tracker = createTracker(base)

    const a = tracker.a
    const b = tracker.b
    const c = tracker.c
    const { d } = c
    const cd = tracker.c.d

    expect(tracker.paths).toEqual([
      ['a'], ['b'], ['c'], ['c', 'd'], ['c', 'd']
    ])
  })

  test("accessPath: parent value only be access once", () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3, h: 5 },
      e: { f: 4 },
    }

    const tracker = createTracker(base)

    const a = tracker.a
    const b = tracker.b
    const c = tracker.c
    const { d, h } = c

    expect(tracker.paths).toEqual([
      ['a'], ['b'], ['c'], ['c', 'd'], ['c', 'h']
    ])
  })
})