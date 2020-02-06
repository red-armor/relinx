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