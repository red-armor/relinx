import { createTracker } from '../proxy'
import { generateRemarkablePaths } from '../path'

describe('generate remarkable', () => {
  test('has no intermediate value', () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3, f: { h: 4 }}
    }

    const tracker = createTracker(base)
    const h = tracker.c.f.h
    const remarkable = generateRemarkablePaths(tracker.paths)
    expect(remarkable).toEqual([['c', 'f', 'h']])
  })

  test('with spread value', () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3, f: { h: 4 }}
    }

    const tracker = createTracker(base)
    const { h } = tracker.c.f
    const remarkable = generateRemarkablePaths(tracker.paths)
    expect(remarkable).toEqual([['c', 'f', 'h']])
  })

  test('with intermediate value', () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3, f: { h: 4 }}
    }

    const tracker = createTracker(base)
    const f = tracker.c.f
    const h = f.h
    const remarkable = generateRemarkablePaths(tracker.paths)
    expect(remarkable).toEqual([['c', 'f', 'h']])
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

    const remarkable = generateRemarkablePaths(tracker.paths)

    expect(remarkable).toEqual([['c', 'f', 'h']])
  })

  test('with intermediate value and `setRemarkable`', () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3, f: { h: 4 }}
    }

    const tracker = createTracker(base)
    const f = tracker.c.f
    const h = f.h
    const x = f

    f.setRemarkable()
    const remarkable = generateRemarkablePaths(tracker.paths)
    expect(remarkable).toEqual([['c', 'f'], ['c', 'f', 'h']])
  })
})

describe('generate array remarkable path', () => {
  test('access index', () => {
    const base = [4, 5, 6]

    const tracker = createTracker(base)
    const a = tracker[0]
    const remarkable = generateRemarkablePaths(tracker.paths)
    expect(remarkable).toEqual([['0']])
  })

  test('access nested array', () => {
    const base = [{ a: { b: [{ c: 1 }]}}]
    const tracker = createTracker(base)
    const c = tracker[0].a.b[0].c
    const remarkable = generateRemarkablePaths(tracker.paths)
    expect(remarkable).toEqual([['0', 'a', 'b', '0', 'c']])
  })

  test('call `map` function', () => {
    const base = [4, 5, 6]

    const tracker = createTracker(base)
    const len = tracker.length
    for (let i = 0; i < len; i++) {
      const a = tracker[i]
    }
    const remarkable = generateRemarkablePaths(tracker.paths)
    expect(remarkable).toEqual([['2'], ['1'], ['0'], ['length']])
  })

  test('remarkable path will remove duplicate path', () => {
    const base = [4, 5, 6]

    const tracker = createTracker(base)
    for (let i = 0; i < tracker.length; i++) {
      const a = tracker[i]
    }
    const remarkable = generateRemarkablePaths(tracker.paths)
    expect(remarkable).toEqual([['length'], ['2'], ['1'], ['0']])
  })
})