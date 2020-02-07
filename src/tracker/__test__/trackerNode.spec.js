import Tracker from '../index'

testTracker(true)

function testTracker(useProxy) {
  const decorateDesc = (text, useProxy) => useProxy ? `proxy: ${text}` : `es5: ${text}`

  describe(`${decorateDesc('create object tracker', useProxy)}`, () => {
    test("access baseNode under nestNode context", () => {
      const base = {
        a: 1,
        b: 2,
        c: 3,
      }

      const nest = {
        e: 3,
        f: 4,
      }

      const baseNode = Tracker({ base: base, useProxy })
      const nestNode = Tracker({ base: nest, useProxy })
      const a = baseNode.tracker.a
      const e = nestNode.tracker.e
      const nestRemarkable = nestNode.tracker.getRemarkablePaths()
      const baseRemarkable = baseNode.tracker.getRemarkablePaths()
      expect(nestRemarkable).toEqual([['e'], ['a']])
      expect(baseRemarkable).toEqual([])
    })
  })

  describe(`${decorateDesc('create object tracker', useProxy)}`, () => {
    test("simulate prop propagation 1", () => {
      const base = [{
        a: 1,
      }, {
        b: 2
      }]
      const copy = base

      const nest = {
        e: 3,
        f: 4,
      }

      const copyNode = Tracker({ base: copy, useProxy })
      const nestNode = Tracker({ base: nest, useProxy })

      const prop = copyNode.tracker[0]
      expect(prop.a).toBe(1)
      base[0].a = 3
      expect(prop.a).toBe(3)
    })

    test("simulate prop propagation 2", () => {
      const base = [{
        a: 1,
      }, {
        b: 2
      }]
      const copy = base

      const nest = {
        e: 3,
        f: 4,
      }

      const copyNode = Tracker({ base: copy, useProxy })
      const nestNode = Tracker({ base: nest, useProxy })

      const prop = copyNode.tracker[0]
      expect(prop.a).toBe(1)
      base[0] = { ...base[0], a: 4}
      expect(prop.a).toBe(1)
    })

    test("simulate prop propagation 2", () => {
      const base = [{
        a: 1,
      }, {
        b: 2
      }]
      const copy = base

      const nest = {
        e: 3,
        f: 4,
      }

      const copyNode = Tracker({ base: copy, useProxy })
      const nestNode = Tracker({ base: nest, useProxy })

      const prop = copyNode.tracker[0]
      expect(prop.a).toBe(1)

      copyNode.tracker.relink('0', { ...base[0], a: 4 })
      expect(prop.a).toBe(4)
    })

    test("simulate prop propagation 3", () => {
      const base = {
        a: 1,
        b: 2,
        c: {
          d: 4,
          e: [{
            f: 7
          }]
        }
      }
      const copy = base

      const nest = {
        e: 3,
        f: 4,
      }

      const copyNode = Tracker({ base: copy, useProxy })
      const nestNode = Tracker({ base: nest, useProxy })

      const prop = copyNode.tracker
      expect(prop.a).toBe(1)
      expect(prop.c.d).toBe(4)
      expect(prop.c.e[0].f).toBe(7)

      copyNode.tracker.relink('a', 5)
      expect(prop.a).toBe(5)
      copyNode.tracker.relink('c', {
        d: 5,
        e: [{
          f: 9
        }]
      })
      expect(prop.c.d).toBe(5)
      expect(prop.c.e[0].f).toBe(9)
    })
  })
}