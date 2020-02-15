import Tracker from '../index'

testTracker(true)
testTracker(false)

function testTracker(useProxy) {
  const decorateDesc = (text, useProxy) => useProxy ? `proxy: ${text}` : `es5: ${text}`
  describe('configuration', () => {
    test('`useProxy` and `useScope` should not be equal', () => {
      expect(() => {
        const base = { a: 1 }
        Tracker({
          base,
          useScope: true,
          useRevoke: true,
        })
      }).toThrow()
    })
  })

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
      const a = baseNode.proxy.a
      const e = nestNode.proxy.e
      const nestRemarkable = nestNode.proxy.runFn('getRemarkableFullPaths')
      const baseRemarkable = baseNode.proxy.runFn('getRemarkableFullPaths')
      expect(nestRemarkable).toEqual([['e'], ['a']])
      expect(baseRemarkable).toEqual([['a']])
    })
  })

  describe(`${decorateDesc('create object tracker', useProxy)}`, () => {
    test("simulate proxy prop 1", () => {
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

      const prop = copyNode.proxy[0]
      expect(prop.a).toBe(1)
      base[0].a = 3
      expect(prop.a).toBe(3)
    })

    test("simulate proxy prop 2", () => {
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

      const prop = copyNode.proxy[0]
      expect(prop.a).toBe(1)
      base[0] = { ...base[0], a: 4}
      expect(prop.a).toBe(4)
    })

    test("simulate proxy prop: relinkProp", () => {
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

      const prop = copyNode.proxy[0]
      expect(prop.a).toBe(1)

      copyNode.proxy.runFn('relinkProp', '0', { ...base[0], a: 4 })
      expect(prop.a).toBe(4)
    })

    test("simulate proxy prop 3", () => {
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

      const prop = copyNode.proxy
      expect(prop.a).toBe(1)
      expect(prop.c.d).toBe(4)
      expect(prop.c.e[0].f).toBe(7)

      copyNode.proxy.runFn('relinkProp', 'a', 5)
      expect(prop.a).toBe(5)
      copyNode.proxy.runFn('relinkProp', 'c', {
        d: 5,
        e: [{
          f: 9
        }]
      })
      expect(prop.c.d).toBe(5)
      expect(prop.c.e[0].f).toBe(9)
    })

    test("simulate proxy prop 3", () => {
      const store = {
        a: {
          a1: { a11: 1 },
          a2: { a21: { a211: 9 }},
          a3: { a31: [{ a311: 7 }]}
        },
        b: {
          b1: { b11: 1 },
          b2: { b21: { b211: 9 }},
          b3: { b31: [{ b311: 7 }]}
        },
        c: {
          c1: { c11: 1 },
          c2: { c21: { c211: 9 }},
          c3: { c31: [{ c311: 7 }]}
        },
      }

      expect(() => {
        const trackerNodeA = Tracker({ base: store.a, useProxy })
        const trackerNodeA1 = Tracker({ base: store.a.a1, useProxy })
        const trackerNodeA2 = Tracker({ base: store.a.a2, parent: trackerNodeA, useProxy })
        const trackerNodeB = Tracker({ base: store.a.a3, parent: null, useProxy })
        const trackerNodeB1 = Tracker({ base: store.a.a1, useProxy })
        const trackerNodeB2 = Tracker({ base: store.a.a2, parent: trackerNodeA, useProxy })
      }).toThrow('Assign a `revoked` parent is forbidden')
    })

    test("verify children", () => {
      const store = {
        a: {
          a1: { a11: 1 },
          a2: { a21: { a211: 9 }},
          a3: { a31: [{ a311: 7 }]}
        },
        b: {
          b1: { b11: 1 },
          b2: { b21: { b211: 9 }},
          b3: { b31: [{ b311: 7 }]}
        },
        c: {
          c1: { c11: 1 },
          c2: { c21: { c211: 9 }},
          c3: { c31: [{ c311: 7 }]}
        },
      }

      const trackerNodeA = Tracker({ base: store.a, useProxy })
      const trackerNodeA1 = Tracker({ base: store.a.a1, useProxy })
      const trackerNodeA2 = Tracker({ base: store.a.a2, parent: trackerNodeA, useProxy })
      const trackerNodeA3 = Tracker({ base: store.a.a3, parent: trackerNodeA, useProxy })
      const trackerNodeB = Tracker({ base: store.a.a3, parent: null, useProxy })
      const trackerNodeB1 = Tracker({ base: store.a.a1, useProxy })
      const trackerNodeB2 = Tracker({ base: store.a.a2, parent: trackerNodeB, useProxy })
      const trackerNodeB3 = Tracker({ base: store.a.a3, parent: trackerNodeB, useProxy })

      expect(trackerNodeA.children.length).toBe(3)
      expect(trackerNodeB.children.length).toBe(3)
    })
  })

  describe(`${decorateDesc('remarkable path', useProxy)}`, () => {
    test('parent props access will mark on child paths', () => {
      const store = {
        a: {
          a1: { a11: 1 },
          a2: { a21: { a211: 9 }},
          a3: { a31: [{ a311: 7 }]}
        },
        b: {
          b1: { b11: 1 },
          b2: { b21: { b211: 9 }},
          b3: { b31: [{ b311: 7 }]},
          b4: 1,
          b5: 'b5'
        },
        c: {
          c1: { c11: 1 },
          c2: { c21: { c211: 9 }},
          c3: { c31: [{ c311: 7 }]}
        },
      }
      const trackerNodeA = Tracker({ base: store.a, useProxy })
      const trackerNodeA1 = Tracker({ base: store.a.a1, useProxy })
      const trackerNodeA2 = Tracker({ base: store.a.a2, parent: trackerNodeA, useProxy })
      const trackerNodeA3 = Tracker({ base: store.a.a3, parent: trackerNodeA, useProxy })

      const trackerNodeB = Tracker({ base: store.b, parent: null, useProxy })
      const trackerNodeB1 = Tracker({ base: store.b.b1, useProxy })
      const trackerNodeB2 = Tracker({ base: store.b.b2, parent: trackerNodeB, useProxy })

      const b21 = trackerNodeB2.tracker.b21
      const { b211 } = b21
      const b_b1_b11 = trackerNodeB.tracker.b1.b11
      const { b4, b5 } = trackerNodeB.tracker
      const remarkable = trackerNodeB2.tracker.runFn('getRemarkableFullPaths')

      expect(remarkable).toEqual([
        ['b5'],
        ['b4'],
        ["b1", "b11"],
        ["b21", "b211"],
      ])
    })
  })

  describe(`${decorateDesc('property access', useProxy)}`, () => {
    test("parent node could be accessed", () => {
      const store = {
        a: {
          a1: { a11: 1 },
          a2: { a21: { a211: 9 }},
          a3: { a31: [{ a311: 7 }]}
        },
        b: {
          b1: { b11: 1 },
          b2: { b21: { b211: 9 }},
          b3: { b31: [{ b311: 7 }]}
        },
        c: {
          c1: { c11: 1 },
          c2: { c21: { c211: 9 }},
          c3: { c31: [{ c311: 7 }]}
        },
      }

      const trackerNodeA = Tracker({ base: store.a, useProxy })
      const trackerNodeA1 = Tracker({ base: store.a.a1, useProxy })
      const trackerNodeA2 = Tracker({ base: store.a.a2, parent: trackerNodeA, useProxy })
      const trackerNodeA3 = Tracker({ base: store.a.a3, parent: trackerNodeA, useProxy })

      const trackerNodeB = Tracker({ base: store.b, parent: null, useProxy })
      const trackerNodeB1 = Tracker({ base: store.b.b1, useProxy })
      const trackerNodeB2 = Tracker({ base: store.b.b2, parent: trackerNodeB, useProxy })
      const b21 = trackerNodeB2.tracker.b21
      const { b211 } = b21
      const b_b1_b11 = trackerNodeB.tracker.b1.b11
      expect(b_b1_b11).toBe(1)
    })

    test("sibling node cross access is forbidden", () => {
      const store = {
        a: {
          a1: { a11: 1 },
          a2: { a21: { a211: 9 }},
          a3: { a31: [{ a311: 7 }]}
        },
        b: {
          b1: { b11: 1 },
          b2: { b21: { b211: 9 }},
          b3: { b31: [{ b311: 7 }]}
        },
        c: {
          c1: { c11: 1 },
          c2: { c21: { c211: 9 }},
          c3: { c31: [{ c311: 7 }]}
        },
      }
      expect(() => {
        const trackerNodeA = Tracker({ base: store.a, useProxy })
        const trackerNodeA1 = Tracker({ base: store.a.a1, useProxy })
        const trackerNodeA2 = Tracker({ base: store.a.a2, parent: trackerNodeA, useProxy })
        const trackerNodeA3 = Tracker({ base: store.a.a3, parent: trackerNodeA, useProxy })

        const trackerNodeB = Tracker({ base: store.b, parent: null, useProxy })
        const trackerNodeB1 = Tracker({ base: store.b.b1, useProxy })
        const trackerNodeB2 = Tracker({ base: store.b.b2, parent: trackerNodeB, useProxy })
        const b21 = trackerNodeB2.tracker.b21
        const { b211 } = b21
        const b11 = trackerNodeB1.tracker.b11
      }).toThrow('Cannot perform \'get\' on a proxy that has been revoked')
    })
  })

  describe('revoke', () => {
    test('revoked after enter into other node scop', () => {
      const store = {
        a: {
          a1: { a11: 1 },
          a2: { a21: { a211: 9 }},
          a3: { a31: [{ a311: 7 }]}
        },
        b: {
          b1: { b11: 1 },
          b2: { b21: { b211: 9 }},
          b3: { b31: [{ b311: 7 }]}
        },
        c: {
          c1: { c11: 1 },
          c2: { c21: { c211: 9 }},
          c3: { c31: [{ c311: 7 }]}
        },
      }

      const trackerNodeA = Tracker({ base: store.a, useProxy })
      const trackerNodeA1 = Tracker({ base: store.a.a1, useProxy })
      expect(trackerNodeA.isRevoked).toBe(false)
      expect(trackerNodeA1.isRevoked).toBe(false)

      const trackerNodeA2 = Tracker({ base: store.a.a2, parent: trackerNodeA, useProxy })
      expect(trackerNodeA.isRevoked).toBe(false)
      expect(trackerNodeA1.isRevoked).toBe(true)
      expect(trackerNodeA2.isRevoked).toBe(false)

      const trackerNodeA3 = Tracker({ base: store.a.a3, parent: trackerNodeA, useProxy })
      expect(trackerNodeA.isRevoked).toBe(false)
      expect(trackerNodeA1.isRevoked).toBe(true)
      expect(trackerNodeA2.isRevoked).toBe(true)

      const trackerNodeB = Tracker({ base: store.b, parent: null, useProxy })
      expect(trackerNodeA.isRevoked).toBe(true)
      expect(trackerNodeA3.isRevoked).toBe(true)
      expect(trackerNodeB.isRevoked).toBe(false)

      const trackerNodeB1 = Tracker({ base: store.b.b1, useProxy })
      expect(trackerNodeB.isRevoked).toBe(false)
      expect(trackerNodeB1.isRevoked).toBe(false)

      const trackerNodeB2 = Tracker({ base: store.b.b2, parent: trackerNodeB, useProxy })
      expect(trackerNodeB.isRevoked).toBe(false)
      expect(trackerNodeB1.isRevoked).toBe(true)
      expect(trackerNodeB2.isRevoked).toBe(false)
    })
  })
}