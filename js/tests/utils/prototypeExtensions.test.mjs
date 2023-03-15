describe('prototype extensions', () => {
  describe('number.prototype', () => {
    test('number.prototype.between - 1 is between 0 and 2', () => {
      expect((1).between(0, 2)).toBe(true)
    })

    test('number.prototype.between - 1 is between 1 and 2 (only bottom inclusive)', () => {
      expect((1).between(1, 2, false, true)).toBe(true)
    })

    test('number.prototype.between - 2 is between 1 and 2 (inclusive)', () => {
      expect((2).between(1, 2, true)).toBe(true)
    })
  })

  describe('object.prototype', () => {
    const TEST_OBJECT = {
      testKey: 'testValue',
    }

    test('object.prototype.values is equivalent to object.values', () => {
      expect(TEST_OBJECT.values).toEqual(Object.values(TEST_OBJECT))
    })

    test('object.prototype.keys is equivalent to object.keys', () => {
      expect(TEST_OBJECT.keys).toEqual(Object.keys(TEST_OBJECT))
    })

    test('object.prototype.entries is equivalent to object.entries', () => {
      expect(TEST_OBJECT.entries).toEqual(Object.entries(TEST_OBJECT))
    })
  })

  describe('array.prototype', () => {
    test('array.prototype.sum correctly sums numbers in array', () => {
      const TEST_ARRAY = [1, 2, 3]

      expect(TEST_ARRAY.sum()).toEqual(6)
    })

    test('array.prototype.insertAt correctly inserts items into array', () => {
      const TEST_ARRAY = [1, 2, 3]
      const TEST_RESULT_ARRAY = [1, 2, 4, 5, 3]

      expect(TEST_ARRAY.insertAt(2, 4, 5)).toEqual(TEST_RESULT_ARRAY)
    })
  })
})
