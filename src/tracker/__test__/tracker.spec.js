import createTracker from '../index'

describe('create tracker', () => {
  test("access property", () => {
    const base = {
      a: 1,
      b: 2,
      c: { d: 3 }
    }

    const tracker = createTracker({ base })

    expect(tracker.a).toBe(1)
    expect(tracker.b).toBe(2)
    expect(tracker.c.d).toBe(3)
  })
})