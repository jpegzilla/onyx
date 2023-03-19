/**
 * @jest-environment jsdom
 */

import {
  calculateLuminance,
  getContrastRatio,
  isElementBackgroundBright,
  findClosestColor,
  calculateCIEDE2000,
} from './../../../utils/color/calculations.mjs'

describe('calculateLuminance', () => {
  test('the relative luminance of pure white is 1', () => {
    const lum = calculateLuminance(255, 255, 255)
    expect(lum).toBe(1)
  })

  test('the relative luminance of pure red is 0.2126', () => {
    const lum = calculateLuminance(255, 0, 0)
    expect(lum).toBe(0.2126)
  })

  test('the relative luminance of pure black is 0', () => {
    const lum = calculateLuminance(0, 0, 0)
    expect(lum).toBe(0)
  })
})

describe('getContrastRatio', () => {
  test('the contrast ratio between white and black is 21', () => {
    const contrast = getContrastRatio(
      { fg: { h: 0, s: 0, l: 0, a: 1 }, bg: { h: 0, s: 0, l: 100, a: 1 } },
      'hsl'
    )

    const {
      number,
      wcag: [code],
      string,
    } = contrast

    expect(number).toBe(21)
    expect(string).toBe('1.05:0.05')
    expect(code).toBe('aaa')
  })

  test('poorly contrasting colors fail wcag standards', () => {
    const contrast = getContrastRatio(
      { fg: { h: 0, s: 0, l: 0, a: 1 }, bg: { h: 0, s: 0, l: 0, a: 1 } },
      'hsl'
    )

    const {
      number,
      wcag: [code],
    } = contrast

    expect(number).toBe(1)
    expect(code).toBe('fail')
  })
})

describe('isElementBackgroundBright', () => {
  test('black background is reported as dark', () => {
    const div = document.createElement('div')
    div.style.backgroundColor = 'rgb(0, 0, 0)'

    expect(isElementBackgroundBright(div)).toBe(false)
  })

  test('white background is reported as bright', () => {
    const div = document.createElement('div')
    div.style.backgroundColor = 'rgb(255, 255, 255)'

    expect(isElementBackgroundBright(div)).toBe(true)
  })
})

describe('findClosestColor', () => {
  const MOCK_CSS_COLOR_LIBRARY = [
    {
      name: 'aliceblue',
      hex: '#f0f8ff',
    },
    {
      name: 'antiquewhite',
      hex: '#faebd7',
    },
    {
      name: 'aqua',
      hex: '#00ffff',
    },
    {
      name: 'aquamarine',
      hex: '#7fffd4',
    },
    {
      name: 'azure',
      hex: '#f0ffff',
    },
    {
      name: 'beige',
      hex: '#f5f5dc',
    },
    {
      name: 'bisque',
      hex: '#ffe4c4',
    },
    {
      name: 'black',
      hex: '#000000',
    },
    {
      name: 'white',
      hex: '#ffffff',
    },
  ]

  test('finds the closest color within a library, given a library object and a color to search for', () => {
    // COMBAK:
    // this [0, 1] normalized hsv is very confusing, maybe don't use this
    const closestColorBlack = findClosestColor(
      {
        color: { h: 0.23, s: 1, v: 0.1 },
        library: MOCK_CSS_COLOR_LIBRARY,
      },
      'labDiff'
    )

    const closestColorAquamarine = findClosestColor(
      {
        // real hsv: 129.6, 100, 100
        color: { h: 0.36, s: 1, v: 1 },
        library: MOCK_CSS_COLOR_LIBRARY,
      },
      'labDiff'
    )

    const closestColorAliceBlue = findClosestColor(
      {
        // real hsv: 194.4, 6, 100
        color: { h: 0.54, s: 0.06, v: 1 },
        library: MOCK_CSS_COLOR_LIBRARY,
      },
      'labDiff'
    )

    expect(closestColorBlack.name).toBe('black')
    expect(closestColorAquamarine.name).toBe('aquamarine')
    expect(closestColorAliceBlue.name).toBe('aliceblue')
  })
})

describe('calculateCIEDE2000', () => {
  // hajim.rochester.edu/ece/sites/gsharma/ciede2000/ciede2000noteCRNA.pdf
  // data source: page four
  const COLOR_DIFFERENCE_TEST_DATA = [
    {
      color1: { l: 50.0, a: 2.6772, b: -79.7751 },
      color2: { l: 50.0, a: 0.0, b: -82.7485 },
      deltaE: 2.0425,
    },
    {
      color1: { l: 60.2574, a: -34.0099, b: 36.2677 },
      color2: { l: 60.4626, a: -34.1751, b: 39.4387 },
      deltaE: 1.2644,
    },
    {
      color1: { l: 2.0776, a: 0.0795, b: -1.135 },
      color2: { l: 0.9033, a: -0.0636, b: -0.5514 },
      deltaE: 0.9082,
    },
    {
      color1: { l: 90.9257, a: -0.5406, b: -0.9208 },
      color2: { l: 88.6381, a: -0.8985, b: -0.7239 },
      deltaE: 1.5381,
    },
  ]

  const isWithinRange = (num1, num2, deviation) =>
    Math.abs(num1 - num2) <= deviation

  test(`returns an accurate cie delta e 2000 for a given pair of colors (${COLOR_DIFFERENCE_TEST_DATA.length} color pairs)`, () => {
    for (const { deltaE, color1, color2 } of COLOR_DIFFERENCE_TEST_DATA) {
      const distance = calculateCIEDE2000(color1, color2)

      expect(isWithinRange(distance, deltaE, 0.01)).toBe(true)
    }
  })

  test('equation is symmetric', () => {
    const EXPECTED_DELTA = 0.9082
    const COLOR_PAIR_DATA = [
      {
        color1: { l: 2.0776, a: 0.0795, b: -1.135 },
        color2: { l: 0.9033, a: -0.0636, b: -0.5514 },
        deltaE: EXPECTED_DELTA,
      },
      {
        color1: { l: 0.9033, a: -0.0636, b: -0.5514 },
        color2: { l: 2.0776, a: 0.0795, b: -1.135 },
        deltaE: EXPECTED_DELTA,
      },
    ]

    const [pair1, pair2] = COLOR_PAIR_DATA

    const distance1 = calculateCIEDE2000(pair1.color1, pair1.color2)
    const distance2 = calculateCIEDE2000(pair2.color1, pair2.color2)

    expect(isWithinRange(distance1, distance2, 0.01)).toBe(true)
    expect(isWithinRange(distance1, EXPECTED_DELTA, 0.01)).toBe(true)
  })
})
