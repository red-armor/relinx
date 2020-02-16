import Tracker from "../index"
import context from "../context"

testTracker(true)
testTracker(false)

function testTracker(useProxy) {
	const decorateDesc = (text, useProxy) =>
		useProxy ? `proxy: ${text}` : `es5: ${text}`
	describe("configuration", () => {
		test("`useProxy` and `useScope` should not be equal", () => {
			expect(() => {
				const base = {a: 1}
				Tracker({
					base,
					useScope: true,
					useRevoke: true
				})
			}).toThrow()
		})
	})

	describe(`${decorateDesc("create object tracker", useProxy)}`, () => {
		test("access baseNode under nestNode context", () => {
			const base = {
				a: 1,
				b: 2,
				c: 3
			}

			const nest = {
				e: 3,
				f: 4
			}

			const baseNode = Tracker({base: base, useProxy})
			const nestNode = Tracker({base: nest, useProxy})
			const a = baseNode.proxy.a
			const e = nestNode.proxy.e
			const nestRemarkable = nestNode.proxy.runFn("getRemarkableFullPaths")
			const baseRemarkable = baseNode.proxy.runFn("getRemarkableFullPaths")
			expect(nestRemarkable).toEqual([["e"], ["a"]])
			expect(baseRemarkable).toEqual([["a"]])
		})
	})

	describe(`${decorateDesc("create object tracker", useProxy)}`, () => {
		test("simulate proxy prop 1", () => {
			const base = [
				{
					a: 1
				},
				{
					b: 2
				}
			]
			const copy = base

			const nest = {
				e: 3,
				f: 4
			}

			const copyNode = Tracker({base: copy, useProxy})
			const nestNode = Tracker({base: nest, useProxy})

			const prop = copyNode.proxy[0]
			expect(prop.a).toBe(1)
			base[0].a = 3
			expect(prop.a).toBe(3)
		})

		test("To update prop base value directly", () => {
			const base = [
				{
					a: 1
				},
				{
					b: 2
				}
			]
			const copy = base

			const nest = {
				e: 3,
				f: 4
			}

			const copyNode = Tracker({base: copy, useProxy})
			const nestNode = Tracker({base: nest, useProxy})

			const prop = copyNode.proxy[0]
			expect(prop.a).toBe(1)
			base[0] = {...base[0], a: 4}
			expect(prop.a).toBe(4)
		})

		test("To test relinkProp function", () => {
			const base = [
				{
					a: 1
				},
				{
					b: 2
				}
			]
			const copy = base

			const nest = {
				e: 3,
				f: 4
			}

			const copyNode = Tracker({base: copy, useProxy})
			const nestNode = Tracker({base: nest, useProxy})

			const prop = copyNode.proxy[0]
			expect(prop.a).toBe(1)

			copyNode.proxy.runFn("relinkProp", "0", {...base[0], a: 4})
			expect(prop.a).toBe(4)
			context.trackerNode = null
		})

		test("To test relinkProp function with remove key", () => {
			const base = {
				a: 1,
				b: 2,
				c: {
					d: 4,
					e: [
						{
							f: 7
						}
					]
				}
			}
			const copy = base

			const nest = {
				e: 3,
				f: 4
			}

			const copyNode = Tracker({base: copy, useProxy})
			const nestNode = Tracker({base: nest, useProxy})
			const state = copyNode.proxy
			const old = state.c.d

			copyNode.proxy.runFn("relinkProp", "c", {e: old})
			expect(state.c).toEqual({e: old})
			context.trackerNode = null
		})

		test("To relink primitive value or object", () => {
			const base = {
				a: 1,
				b: 2,
				c: {
					d: 4,
					e: [
						{
							f: 7
						}
					]
				}
			}
			const copy = base

			const nest = {
				e: 3,
				f: 4
			}

			const copyNode = Tracker({base: copy, useProxy})
			const nestNode = Tracker({base: nest, useProxy})

			const prop = copyNode.proxy
			expect(prop.a).toBe(1)
			expect(prop.c.d).toBe(4)
			expect(prop.c.e[0].f).toBe(7)

			copyNode.proxy.runFn("relinkProp", "a", 5)
			expect(prop.a).toBe(5)
			copyNode.proxy.runFn("relinkProp", "c", {
				d: 5,
				e: [
					{
						f: 9
					}
				]
			})
			expect(prop.c.d).toBe(5)
			expect(prop.c.e[0].f).toBe(9)
			context.trackerNode = null
		})

		test("To throw error when access revoked object", () => {
			const store = {
				a: {
					a1: {a11: 1},
					a2: {a21: {a211: 9}},
					a3: {a31: [{a311: 7}]}
				},
				b: {
					b1: {b11: 1},
					b2: {b21: {b211: 9}},
					b3: {b31: [{b311: 7}]}
				},
				c: {
					c1: {c11: 1},
					c2: {c21: {c211: 9}},
					c3: {c31: [{c311: 7}]}
				}
			}
			const useRevoke = true
			const useScope = false

			expect(() => {
				const trackerNodeA = Tracker({
					base: store.a,
					useProxy,
					useRevoke,
					useScope
				})
				const trackerNodeA1 = Tracker({
					base: store.a.a1,
					useProxy,
					useRevoke,
					useScope
				})
				const trackerNodeA2 = Tracker({
					base: store.a.a2,
					parent: trackerNodeA,
					useProxy,
					useRevoke,
					useScope
				})
				const trackerNodeB = Tracker({
					base: store.a.a3,
					parent: null,
					useProxy,
					useRevoke,
					useScope
				})
				const trackerNodeB1 = Tracker({
					base: store.a.a1,
					useProxy,
					useRevoke,
					useScope
				})
				const trackerNodeB2 = Tracker({
					base: store.a.a2,
					parent: trackerNodeA,
					useProxy,
					useRevoke,
					useScope
				})
			}).toThrowError()
			context.trackerNode = null
		})

		test("verify children", () => {
			const store = {
				a: {
					a1: {a11: 1},
					a2: {a21: {a211: 9}},
					a3: {a31: [{a311: 7}]}
				},
				b: {
					b1: {b11: 1},
					b2: {b21: {b211: 9}},
					b3: {b31: [{b311: 7}]}
				},
				c: {
					c1: {c11: 1},
					c2: {c21: {c211: 9}},
					c3: {c31: [{c311: 7}]}
				}
			}

			const trackerNodeA = Tracker({base: store.a, useProxy})
			const trackerNodeA1 = Tracker({base: store.a.a1, useProxy})
			const trackerNodeA2 = Tracker({
				base: store.a.a2,
				parent: trackerNodeA,
				useProxy
			})
			const trackerNodeA3 = Tracker({
				base: store.a.a3,
				parent: trackerNodeA,
				useProxy
			})
			const trackerNodeB = Tracker({base: store.a.a3, parent: null, useProxy})
			const trackerNodeB1 = Tracker({base: store.a.a1, useProxy})
			const trackerNodeB2 = Tracker({
				base: store.a.a2,
				parent: trackerNodeB,
				useProxy
			})
			const trackerNodeB3 = Tracker({
				base: store.a.a3,
				parent: trackerNodeB,
				useProxy
			})

			expect(trackerNodeA.children.length).toBe(3)
			expect(trackerNodeB.children.length).toBe(3)
			context.trackerNode = null
		})
	})

	describe(`${decorateDesc("remarkable path", useProxy)}`, () => {
		test("parent props access will mark on child paths", () => {
			const store = {
				a: {
					a1: {a11: 1},
					a2: {a21: {a211: 9}},
					a3: {a31: [{a311: 7}]}
				},
				b: {
					b1: {b11: 1},
					b2: {b21: {b211: 9}},
					b3: {b31: [{b311: 7}]},
					b4: 1,
					b5: "b5"
				},
				c: {
					c1: {c11: 1},
					c2: {c21: {c211: 9}},
					c3: {c31: [{c311: 7}]}
				}
			}
			const trackerNodeA = Tracker({base: store.a, useProxy})
			const trackerNodeA1 = Tracker({base: store.a.a1, useProxy})
			const trackerNodeA2 = Tracker({
				base: store.a.a2,
				parent: trackerNodeA,
				useProxy
			})
			const trackerNodeA3 = Tracker({
				base: store.a.a3,
				parent: trackerNodeA,
				useProxy
			})

			const trackerNodeB = Tracker({base: store.b, parent: null, useProxy})
			const trackerNodeB1 = Tracker({base: store.b.b1, useProxy})
			const trackerNodeB2 = Tracker({
				base: store.b.b2,
				parent: trackerNodeB,
				useProxy
			})

			const b21 = trackerNodeB2.proxy.b21
			const {b211} = b21
			const b_b1_b11 = trackerNodeB.proxy.b1.b11
			const {b4, b5} = trackerNodeB.proxy
			const remarkable = trackerNodeB2.proxy.runFn("getRemarkableFullPaths")
			context.trackerNode = null
			expect(remarkable).toEqual([
				["b21", "b211"],
				["b5"],
				["b4"],
				["b1", "b11"]
			])
		})
	})

	describe(`${decorateDesc("property access", useProxy)}`, () => {
		test("parent node could be accessed", () => {
			const store = {
				a: {
					a1: {a11: 1},
					a2: {a21: {a211: 9}},
					a3: {a31: [{a311: 7}]}
				},
				b: {
					b1: {b11: 1},
					b2: {b21: {b211: 9}},
					b3: {b31: [{b311: 7}]}
				},
				c: {
					c1: {c11: 1},
					c2: {c21: {c211: 9}},
					c3: {c31: [{c311: 7}]}
				}
			}

			const trackerNodeA = Tracker({base: store.a, useProxy})
			const trackerNodeA1 = Tracker({base: store.a.a1, useProxy})
			const trackerNodeA2 = Tracker({
				base: store.a.a2,
				parent: trackerNodeA,
				useProxy
			})
			const trackerNodeA3 = Tracker({
				base: store.a.a3,
				parent: trackerNodeA,
				useProxy
			})

			const trackerNodeB = Tracker({base: store.b, parent: null, useProxy})
			const trackerNodeB1 = Tracker({base: store.b.b1, useProxy})
			const trackerNodeB2 = Tracker({
				base: store.b.b2,
				parent: trackerNodeB,
				useProxy
			})
			const b21 = trackerNodeB2.proxy.b21
			const {b211} = b21
			const b_b1_b11 = trackerNodeB.proxy.b1.b11
			expect(b_b1_b11).toBe(1)
			context.trackerNode = null
		})

		test("sibling node cross access is forbidden", () => {
			const store = {
				a: {
					a1: {a11: 1},
					a2: {a21: {a211: 9}},
					a3: {a31: [{a311: 7}]}
				},
				b: {
					b1: {b11: 1},
					b2: {b21: {b211: 9}},
					b3: {b31: [{b311: 7}]}
				},
				c: {
					c1: {c11: 1},
					c2: {c21: {c211: 9}},
					c3: {c31: [{c311: 7}]}
				}
			}

			expect(() => {
				const trackerNodeA = Tracker({base: store.a, useProxy})
				const trackerNodeA1 = Tracker({base: store.a.a1, useProxy})
				const trackerNodeA2 = Tracker({
					base: store.a.a2,
					parent: trackerNodeA,
					useProxy
				})
				const trackerNodeA3 = Tracker({
					base: store.a.a3,
					parent: trackerNodeA,
					useProxy
				})

				const trackerNodeB = Tracker({base: store.b, parent: null, useProxy})
				const trackerNodeB1 = Tracker({base: store.b.b1, useProxy})
				const trackerNodeB2 = Tracker({
					base: store.b.b2,
					parent: trackerNodeB,
					useProxy
				})
				const b21 = trackerNodeB2.proxy.b21
				const {b211} = b21
				const b11 = trackerNodeB1.proxy.b11
			}).toThrowError()
			context.trackerNode = null
		})
	})

	describe(`${decorateDesc("revoke", useProxy)}`, () => {
		test("revoked after enter into other node scope", () => {
			const ss = {
				a: {
					a1: {a11: 1},
					a2: {a21: {a211: 9}},
					a3: {a31: [{a311: 7}]}
				},
				b: {
					b1: {b11: 1},
					b2: {b21: {b211: 9}},
					b3: {b31: [{b311: 7}]}
				},
				c: {
					c1: {c11: 1},
					c2: {c21: {c211: 9}},
					c3: {c31: [{c311: 7}]}
				}
			}

			const useRevoke = true
			const useScope = false

			const trackerNodeA_1 = Tracker({
				base: ss.a,
				useProxy,
				useRevoke,
				useScope
			})
			const trackerNodeA1_1 = Tracker({
				base: ss.a.a1,
				useProxy,
				useRevoke,
				useScope
			})
			expect(trackerNodeA_1.isRevoked).toBe(false)
			expect(trackerNodeA1_1.isRevoked).toBe(false)

			const trackerNodeA2_1 = Tracker({
				base: ss.a.a2,
				parent: trackerNodeA_1,
				useProxy,
				useRevoke,
				useScope
			})
			expect(trackerNodeA_1.isRevoked).toBe(false)
			expect(trackerNodeA1_1.isRevoked).toBe(true)
			expect(trackerNodeA2_1.isRevoked).toBe(false)

			const trackerNodeA3_1 = Tracker({
				base: ss.a.a3,
				parent: trackerNodeA_1,
				useProxy,
				useRevoke,
				useScope
			})
			expect(trackerNodeA_1.isRevoked).toBe(false)
			expect(trackerNodeA1_1.isRevoked).toBe(true)
			expect(trackerNodeA2_1.isRevoked).toBe(true)

			const trackerNodeB_1 = Tracker({
				base: ss.b,
				parent: null,
				useProxy,
				useRevoke,
				useScope
			})
			expect(trackerNodeA_1.isRevoked).toBe(true)
			expect(trackerNodeA3_1.isRevoked).toBe(true)
			expect(trackerNodeB_1.isRevoked).toBe(false)

			const trackerNodeB1_1 = Tracker({
				base: ss.b.b1,
				useProxy,
				useRevoke,
				useScope
			})
			expect(trackerNodeB_1.isRevoked).toBe(false)
			expect(trackerNodeB1_1.isRevoked).toBe(false)

			const trackerNodeB2_1 = Tracker({
				base: ss.b.b2,
				parent: trackerNodeB_1,
				useProxy,
				useRevoke,
				useScope
			})
			expect(trackerNodeB_1.isRevoked).toBe(false)
			expect(trackerNodeB1_1.isRevoked).toBe(true)
			expect(trackerNodeB2_1.isRevoked).toBe(false)
			context.trackerNode = null
		})
	})

	describe("array: prototype function", () => {
		test("empty array prop", () => {
			const base = {
				a: {
					b: []
				},
				c: {
					d: 1
				}
			}

			const A = Tracker({base: base.a, useProxy})
			const C = Tracker({base: base.c, parent: A, useProxy})
			const mapValue = A.proxy.b.map(i => i)

			expect(mapValue).toEqual([])
		})
	})
}
