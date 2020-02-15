import createTracker from '../proxy'
import createES5Tracker from '../es5'
import { generateRemarkablePaths } from '../path'
import { TRACKER } from '../commons'

testTracker(true)
testTracker(false)

function testTracker(useProxy) {
  const fn = useProxy ? createTracker : createES5Tracker

  describe('generate remarkable', () => {
    test('has no intermediate value', () => {
      const base = {
        a: 1,
        b: 2,
        c: { d: 3, f: { h: 4 }}
      }

      const tracker = fn(base, { useScope: false })
      const h = tracker.c.f.h
      const remarkable = generateRemarkablePaths(tracker.getProp('paths'))
      expect(remarkable).toEqual([['c', 'f', 'h']])
    })

    test('with spread value', () => {
      const base = {
        a: 1,
        b: 2,
        c: { d: 3, f: { h: 4 }}
      }

      const tracker = fn(base, { useScope: false })
      const { h } = tracker.c.f
      const remarkable = generateRemarkablePaths(tracker.getProp('paths'))
      expect(remarkable).toEqual([['c', 'f', 'h']])
    })

    test('with intermediate value', () => {
      const base = {
        a: 1,
        b: 2,
        c: { d: 3, f: { h: 4 }}
      }

      const tracker = fn(base, { useScope: false })
      const f = tracker.c.f
      const h = f.h
      const remarkable = generateRemarkablePaths(tracker.getProp('paths'))

      expect(remarkable).toEqual([['c', 'f', 'h']])
    })

    test('with intermediate value and use it', () => {
      const base = {
        a: 1,
        b: 2,
        c: { d: 3, f: { h: 4 }}
      }

      const tracker = fn(base, { useScope: false })
      const f = tracker.c.f
      const h = f.h
      const x = f
      const remarkable = generateRemarkablePaths(tracker.getProp('paths'))

      expect(remarkable).toEqual([['c', 'f', 'h']])
    })

    test('with intermediate value and `setRemarkable`', () => {
      const base = {
        a: 1,
        b: 2,
        c: { d: 3, f: { h: 4 }}
      }

      const tracker = fn(base, { useScope: false })
      const f = tracker.c.f
      const h = f.h
      const x = f

      f.runFn('setRemarkable')
      const remarkable = generateRemarkablePaths(tracker.getProp('paths'))
      expect(remarkable).toEqual([['c', 'f'], ['c', 'f', 'h']])
    })
  })

  describe('generate array remarkable path', () => {
    test('access index', () => {
      const base = [4, 5, 6]

      const tracker = fn(base, { useScope: false })
      const a = tracker[0]
      const remarkable = generateRemarkablePaths(tracker.getProp('paths'))

      expect(remarkable).toEqual([['0']])
    })

    test('access nested array', () => {
      const base = [{ a: { b: [{ c: 1 }]}}]
      const tracker = fn(base, { useScope: false })
      const c = tracker[0].a.b[0].c
      const remarkable = generateRemarkablePaths(tracker.getProp('paths'))
      expect(remarkable).toEqual([['0', 'a', 'b', '0', 'c']])
    })

    // test('call `for` function', () => {
    //   const base = [4, 5, 6]

    //   const tracker = fn(base)
    //   const len = tracker.length
    //   for (let i = 0; i < len; i++) {
    //     const a = tracker[i]
    //   }
    //   let remarkable
    //   if (useProxy) {
    //     remarkable = generateRemarkablePaths(tracker.getProp('paths'))
    //   } else {
    //     remarkable = generateRemarkablePaths(tracker.getProp('paths'))
    //   }
    //   expect(remarkable).toEqual([['2'], ['1'], ['0'], ['length']])
    // })

    test('call `map` function', () => {
      const base = [4, 5, 6]

      const tracker = fn(base, { useScope: false })
      tracker.map(item => {
        //
      })

      const remarkable = generateRemarkablePaths(tracker.getProp('paths'))
      expect(remarkable).toEqual([['2'], ['1'], ['0'], ['length']])
    })

    test('call `forEach` function', () => {
      const base = [4, 5, 6]

      const tracker = fn(base, { useScope: false })
      tracker.forEach(item => {})

      const remarkable = generateRemarkablePaths(tracker.getProp('paths'))
      expect(remarkable).toEqual([['2'], ['1'], ['0'], ['length']])
    })
  })
}

