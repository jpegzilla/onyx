jest.unstable_mockModule('./../main.mjs', () => ({
  arachne: {
    error: jest.fn(),
  },
  minerva: {
    set: jest.fn(),
  },
}))

const { default: LimitedList } = await import(
  './../../../utils/dataStructures/limitedList.mjs'
)

const { minerva, arachne } = await import('./../../../main.mjs')

describe('LimitedList', () => {
  const TEST_LIMIT = 5
  const TEST_INITIALIZER = []

  const testLimitedList = new LimitedList({
    limit: TEST_LIMIT,
    initializer: TEST_INITIALIZER,
  })

  test('list initializes correctly', () => {
    expect(testLimitedList.limit).toBe(TEST_LIMIT)
    expect(testLimitedList.items).toEqual(TEST_INITIALIZER)
  })

  test('setAt() sets an item at the specified index', () => {
    testLimitedList.setAt(0, 1)

    expect(testLimitedList.items[0]).toBe(1)
  })

  test('removeAt() removes the item at the specified index', () => {
    testLimitedList.removeAt(0)

    expect(testLimitedList.items[0]).toBe(undefined)
  })

  test('undo() undoes the previously added item', () => {
    testLimitedList.setAt(0, 1).undo()

    expect(testLimitedList.items[0]).toBe(undefined)
  })

  test('redo() repeats the previously undone action', () => {
    testLimitedList.redo()

    expect(testLimitedList.items[0]).toBe(1)
  })

  test('previous() returns the second to last item', () => {
    testLimitedList.setAt(0, 1)
    testLimitedList.setAt(1, 2)

    expect(testLimitedList.previous()).toBe(1)
  })

  test('current() returns the last item', () => {
    expect(testLimitedList.current()).toBe(2)
  })

  describe('add()', () => {
    afterEach(() => {
      testLimitedList.clear()
    })

    test('adds a given item to the end of a list', () => {
      testLimitedList.add(1)

      expect(testLimitedList.current()).toBe(1)
    })

    test('prevents number of items from exceeding the given limit', () => {
      testLimitedList.add(1)
      testLimitedList.add(2)
      testLimitedList.add(3)
      testLimitedList.add(4)
      testLimitedList.add(5)
      testLimitedList.add(6)
      testLimitedList.add(7)
      testLimitedList.add(8)

      expect(testLimitedList.items.length).toBe(TEST_LIMIT)
      expect(testLimitedList.items[0]).toBe(4)
      expect(testLimitedList.items.at(-1)).toBe(8)
    })

    test('respects locked items, adding items around locked items (preserving the index of locked items)', () => {
      // 3 locked items at 0, 2, and 4
      // 2 unlocked items at 1 and 3, 5 doesn't matter
      testLimitedList.add({ locked: true, index: 0 })
      testLimitedList.add({ locked: false, index: 1 })
      testLimitedList.add({ locked: true, index: 2 })
      testLimitedList.add({ locked: false, index: 3 })
      testLimitedList.add({ locked: true, index: 4 })
      testLimitedList.add({ locked: false, index: 5 })

      expect(testLimitedList.items.filter(e => e.locked).length).toBe(3)
      expect(testLimitedList.items.filter(e => !e.locked).length).toBe(2)
      testLimitedList.items.forEach((e, i) => {
        if ([0, 2, 4].includes(i)) expect(e).toHaveProperty('locked', true)
        if ([1, 3].includes(i)) expect(e).toHaveProperty('locked', false)
      })
    })
  })

  test('clear() removes everything in the list', () => {
    testLimitedList.add(1)
    testLimitedList.add(1)

    expect(testLimitedList.clear().items.length).toBe(0)
  })

  test('save() calls minerva.set with a key and a list of items', () => {
    testLimitedList.save('testKey')

    expect(minerva.set).toHaveBeenCalledWith('testKey', testLimitedList.items)
  })

  test('save() calls arachne.error when given no key', () => {
    testLimitedList.save()

    expect(arachne.error).toHaveBeenCalledWith(expect.any(String))
  })
})
