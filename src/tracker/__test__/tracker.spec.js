import { createTracker } from '../proxy'

describe('create object tracker', () => {
  test("access property", () => {
    const base = {
      a: 1,
      b: 2,
      c: 3,
    }

    const tracker = createTracker(base)

    expect(tracker.a).toBe(1)
    expect(tracker.b).toBe(2)
    expect(tracker.c).toBe(3)
  })

  test('access nested property', () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 4, f: { h: 5 }},
    }

    const tracker = createTracker(base)

    expect(tracker.a).toBe(1)
    expect(tracker.b).toBe(2)
    expect(tracker.c.d).toBe(4)
    expect(tracker.c.f.h).toBe(5)
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
      ['a'], ['b'], ['c'], ['c'], ['c', 'd']
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

    console.log('tracker.paths ', tracker.paths)

    expect(tracker.paths).toEqual([
      ['a'], ['b'], ['c'], ['c', 'd'], ['c'], ['c', 'd']
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

  test("accessPath: parent value only be access once", () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3, h: 5 },
      e: { f: 4 },
    }

    const tracker = createTracker(base)
    const h = tracker.c.h

    expect(tracker.paths).toEqual([
      ['c'], ['c', 'h']
    ])
  })

  test('with intermediate value and use it', () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3, f: { h: 4 }}
    }

    const tracker = createTracker(base)
    const f = tracker.c.f
    const h = f.h
    const x = f

    expect(tracker.paths).toEqual([
      ['c'], ['c', 'f'], ['c', 'f', 'h']
    ])
  })
})

describe('create array object', () => {
  test('access index', () => {
    const base = [4, 5, 6]

    const tracker = createTracker(base)

    expect(tracker[0]).toBe(4)
    expect(tracker[1]).toBe(5)
    expect(tracker[2]).toBe(6)
  })

  test('access nested array', () => {
    const base = [{ a: { b: [{ c: 1 }]}}]
    const tracker = createTracker(base)
    expect(tracker[0].a.b[0].c).toBe(1)
  })
})