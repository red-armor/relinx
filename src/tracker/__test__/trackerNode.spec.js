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

    test("simulate prop propagation 3", () => {
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

  describe('remarkable path', () => {
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
      const remarkable = trackerNodeB2.tracker.getRemarkablePaths()

      expect(remarkable).toEqual([
        ['b5'],
        ['b4'],
        ["b1", "b11"],
        ["b21", "b211"],
      ])
    })
  })

  describe('property access', () => {
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
}