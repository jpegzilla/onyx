jest.unstable_mockModule('./../main.mjs', () => ({
  minerva: {
    set: jest.fn(),
    get: jest.fn(),
  },
  arachne: {},
}))

const { default: Palette } = await import(
  './../../../utils/dataStructures/palette.mjs'
)

const { minerva } = await import('./../../../main.mjs')

describe('palette', () => {
  const TEST_INITIALIZER = []
  const TEST_ID = 'test_id'
  const TEST_COLOR_OBJECTS = [
    { h: 1, s: 1, l: 1 },
    { h: 2, s: 2, l: 2 },
    { h: 3, s: 3, l: 3 },
  ]

  const testPalette = new Palette({
    initializer: TEST_INITIALIZER,
    initialId: TEST_ID,
  })

  test('palette initializes correctly', () => {
    expect(testPalette.id).toBe(TEST_ID)
    expect(testPalette.colorList.items).toEqual(TEST_INITIALIZER)
  })

  test('createColorObject() creates color objects as expected', () => {
    const colorObject = testPalette.createColorObject(TEST_COLOR_OBJECTS[0])

    expect(colorObject).toMatchObject({
      color: TEST_COLOR_OBJECTS[0],
      locked: false,
    })
  })

  test('addColor() correctly adds colors to the list', () => {
    TEST_COLOR_OBJECTS.forEach(e => testPalette.addColor(e))

    expect(testPalette.colorList.items).toEqual(
      TEST_COLOR_OBJECTS.map(e => testPalette.createColorObject(e))
    )
  })

  test('lock() correctly locks colors in the list', () => {
    testPalette.lock(1)

    expect(testPalette.colorList.items[1]).toMatchObject({
      color: TEST_COLOR_OBJECTS[1],
      locked: true,
    })
  })

  test('move() moves an item in the list correctly, respecting locked items', () => {
    testPalette.move(2, -1)
    testPalette.move(1, 1)

    expect(testPalette.colorList.items[0].color).toEqual(TEST_COLOR_OBJECTS[2])

    testPalette.move(0, 1)

    expect(testPalette.colorList.items[2].color).toEqual(TEST_COLOR_OBJECTS[2])
    expect(testPalette.colorList.items[1].color).toEqual(TEST_COLOR_OBJECTS[1])
  })
})
