import createES5Tracker from "../es5"
import createTracker from "../proxy"
import {TRACKER} from "../commons"

testTracker(true)
testTracker(false)

function testTracker(useProxy) {
	const fn = useProxy ? createTracker : createES5Tracker
	const decorateDesc = (text, useProxy) =>
		useProxy ? `proxy: ${text}` : `es5: ${text}`

	describe(`${decorateDesc("create object tracker", useProxy)}`, () => {
		test("access property", () => {
			const base = {
				a: 1,
				b: 2,
				c: 3
			}

			const tracker = fn(base, {useScope: false})

			expect(tracker.a).toBe(1)
			expect(tracker.b).toBe(2)
			expect(tracker.c).toBe(3)
		})

		test(`${decorateDesc("access nested property", useProxy)}`, () => {
			const base = {
				a: 1,
				b: 2,
				c: {d: 4, f: {h: 5}}
			}

			const tracker = fn(base, {useScope: false})

			if (useProxy) {
				expect(tracker.a).toBe(1)
				expect(tracker.b).toBe(2)
				expect(tracker.c.d).toBe(4)
				expect(tracker.c.f.h).toBe(5)
			} else {
				expect(tracker.a).toBe(1)
				expect(tracker.b).toBe(2)
				expect(tracker.c.d).toBe(4)
				expect(tracker.c.f.h).toBe(5)
			}
		})

		test(`${decorateDesc("access object base value", useProxy)}`, () => {
			const base = {
				a: 1,
				b: 2,
				c: 3
			}

			const tracker = fn(base, {useScope: false})
			const baseValue = tracker.getProp("base")
			expect(baseValue).toEqual({a: 1, b: 2, c: 3})
		})

		test(`${decorateDesc("accessPath", useProxy)}`, () => {
			const base = {
				a: 1,
				b: 2,
				c: {d: 3}
			}

			const tracker = fn(base, {useScope: false})

			const a = tracker.a
			const b = tracker.b
			const c = tracker.c
			const d = tracker.c.d
			const paths = tracker.getProp("paths")
			expect(paths).toEqual([["a"], ["b"], ["c"], ["c"], ["c", "d"]])
		})

		test(`${decorateDesc("accessPath: with spread value", useProxy)}`, () => {
			const base = {
				a: 1,
				b: 2,
				c: {d: 3}
			}

			const tracker = fn(base, {useScope: false})

			const a = tracker.a
			const b = tracker.b
			const c = tracker.c
			const {d} = c
			const paths = tracker.getProp("paths")

			expect(paths).toEqual([["a"], ["b"], ["c"], ["c", "d"]])
		})

		test(`${decorateDesc(
			"accessPath: intermediate trackable value access should be tracked",
			useProxy
		)}`, () => {
			const base = {
				a: 1,
				b: 2,
				c: {d: 3, h: 5},
				e: {f: 4}
			}

			const tracker = fn(base, {useScope: false})

			const a = tracker.a
			const b = tracker.b
			const c = tracker.c
			const {d} = c
			const cd = tracker.c.d
			const paths = tracker.getProp("paths")

			expect(paths).toEqual([
				["a"],
				["b"],
				["c"],
				["c", "d"],
				["c"],
				["c", "d"]
			])
		})

		test(`${decorateDesc(
			"accessPath: parent value only be access once",
			useProxy
		)}`, () => {
			const base = {
				a: 1,
				b: 2,
				c: {d: 3, h: 5},
				e: {f: 4}
			}

			const tracker = fn(base, {useScope: false})
			const a = tracker.a
			const b = tracker.b
			const c = tracker.c
			const {d, h} = c
			const paths = tracker.getProp("paths")

			expect(paths).toEqual([["a"], ["b"], ["c"], ["c", "d"], ["c", "h"]])
		})

		test(`${decorateDesc(
			"accessPath: parent value only be access once",
			useProxy
		)}`, () => {
			const base = {
				a: 1,
				b: 2,
				c: {d: 3, h: 5},
				e: {f: 4}
			}

			const tracker = fn(base, {useScope: false})
			const h = tracker.c.h
			const paths = tracker.getProp("paths")
			expect(paths).toEqual([["c"], ["c", "h"]])
		})

		test(`${decorateDesc(
			"with intermediate value and use it",
			useProxy
		)}`, () => {
			const base = {
				a: 1,
				b: 2,
				c: {d: 3, f: {h: 4}}
			}

			const tracker = fn(base, {useScope: false})
			const f = tracker.c.f
			const h = f.h
			const x = f
			const paths = tracker.getProp("paths")
			expect(paths).toEqual([["c"], ["c", "f"], ["c", "f", "h"]])
		})

		test(`${decorateDesc("getRemarkableFullPaths", useProxy)}`, () => {
			const base = {
				a: 1,
				b: 2,
				c: {d: 3, f: {h: 4}}
			}

			const tracker = fn(base, {useScope: false})
			const f = tracker.c.f
			const h = f.h
			const x = f
			const remarkable = tracker.runFn("getRemarkableFullPaths")

			expect(remarkable).toEqual([["c", "f", "h"]])
		})
	})

	describe("create array object", () => {
		test(`${decorateDesc("access array base value", useProxy)}`, () => {
			const base = [
				{
					a: 1,
					b: 2,
					c: 3
				}
			]
			const tracker = fn(base, {useScope: false})
			const baseValue = tracker.getProp("base")

			expect(baseValue).toEqual([{a: 1, b: 2, c: 3}])
		})

		test(`${decorateDesc("access index", useProxy)}`, () => {
			const base = [4, 5, 6]
			const tracker = fn(base, {useScope: false})

			expect(tracker[0]).toBe(4)
			expect(tracker[1]).toBe(5)
			expect(tracker[2]).toBe(6)
		})

		test(`${decorateDesc("access nested array", useProxy)}`, () => {
			const base = [{a: {b: [{c: 1}]}}]
			const tracker = fn(base)
			expect(tracker[0].a.b[0].c).toBe(1)
		})
	})
}
