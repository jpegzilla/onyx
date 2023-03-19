/**
 * @jest-environment jsdom
 */

import {
  hexToRGBA,
  hslaToRGB,
  rgbToNHSL,
  rgbaToHSLA,
  hexToHSLA,
  hsvToHSL,
  rgbToDHSL,
  hexToHWB,
  hslaToHWB,
  rgbToXYZ,
  rgbToLAB,
} from './../../../utils/color/conversions.mjs'

const isWithinRange = (num1, num2, deviation) =>
  Math.abs(num1 - num2) <= deviation

describe('hexToRGBA', () => {
  test('correctly converts a three-digit hex color', () => {
    const expectedColor = {
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    }

    const rgbaColor = hexToRGBA('#fff')

    expect(expectedColor).toMatchObject(rgbaColor)
  })

  test('correctly converts a six-digit hex color', () => {
    const expectedColor = {
      r: 255,
      g: 0,
      b: 255,
      a: 1,
    }

    const rgbaColor = hexToRGBA('#ff00ff')

    expect(expectedColor).toMatchObject(rgbaColor)
  })

  test('correctly converts an eight-digit hex color', () => {
    const expectedColor = {
      r: 255,
      g: 255,
      b: 0,
      a: 0,
    }

    const rgbaColor = hexToRGBA('#ffff0000')

    expect(expectedColor).toMatchObject(rgbaColor)
  })
})

describe('hslaToRGB', () => {
  test('correctly converts normalized hsl to rgb', () => {
    const rgbColor1 = hslaToRGB(1, 1, 1, 1)
    // real hsl: 216, 25, 50
    const rgbColor2 = hslaToRGB(0.6, 0.25, 0.5, 1)
    // real hsl: 93.6, 50, 40
    const rgbColor3 = hslaToRGB(0.26, 0.5, 0.4, 1)

    expect(rgbColor1).toMatchObject({
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    })

    expect(rgbColor2).toMatchObject({
      r: 96,
      g: 121,
      b: 159,
      a: 1,
    })

    expect(rgbColor3).toMatchObject({
      r: 96,
      g: 153,
      b: 51,
      a: 1,
    })
  })
})

describe('rgbToNHSL', () => {
  test('correctly converts rgb to normalized [0, 360], [0, 100], [0, 100] hsl', () => {
    const { h, s, l } = rgbToNHSL(96, 153, 51)

    expect(isWithinRange(h, 93, 1)).toBe(true)
    expect(isWithinRange(s, 50, 1)).toBe(true)
    expect(isWithinRange(l, 40, 1)).toBe(true)
  })
})

describe('rgbaToHSLA', () => {
  test('correctly converts rgba to hsla', () => {
    const { h, s, l, a } = rgbaToHSLA(96, 121, 159, 1)

    expect(isWithinRange(h, 0.6 * 360, 1)).toBe(true)
    expect(isWithinRange(s, 0.25 * 100, 1)).toBe(true)
    expect(isWithinRange(l, 0.5 * 100, 1)).toBe(true)
    expect(a).toBe(1)
  })
})

describe('hexToHSLA', () => {
  test('correctly converts hex color to hsla', () => {
    const { h, s, l, a } = hexToHSLA('#ff00ff')

    expect(h).toBe(300)
    expect(s).toBe(100)
    expect(l).toBe(50)
    expect(a).toBe(1)
  })
})

describe('hsvToHSL', () => {
  test('correctly converts hsv color to hsla', () => {
    const { h, s, l } = hsvToHSL({
      h: 0.134,
      s: 1,
      v: 0.5,
    })

    expect(isWithinRange(h, 48, 1)).toBe(true)
    expect(isWithinRange(s, 0.2, 1)).toBe(true)
    expect(isWithinRange(l, 0.3, 1)).toBe(true)
  })
})

describe('rgbToDHSL', () => {
  test('correctly converts rgba to dhsl', () => {
    const { h, s, l } = rgbToDHSL(96, 121, 159)

    expect(isWithinRange(h, 0.6, 1)).toBe(true)
    expect(isWithinRange(s, 0.25, 1)).toBe(true)
    expect(isWithinRange(l, 0.5, 1)).toBe(true)
  })
})

describe('hexToHWB', () => {
  test('correctly converts hex to hwb', () => {
    const hwb = hexToHWB('#ffffff')

    expect(hwb).toMatchObject({
      h: 0,
      w: 100,
      b: 0,
      a: 1,
    })
  })
})

describe('hslaToHWB', () => {
  test('correctly converts hsla to hwb', () => {
    const { h, w, b } = hslaToHWB({ h: 20, s: 10, l: 90, a: 1 })

    expect(isWithinRange(h, 24, 1)).toBe(true)
    expect(isWithinRange(w, 89, 1)).toBe(true)
    expect(isWithinRange(b, 9, 1)).toBe(true)
  })
})

describe('rgbToXYZ', () => {
  test('correctly converts rgb to xyz', () => {
    const { x, y, z } = rgbToXYZ(100, 24, 60)

    expect(isWithinRange(x, 6, 1)).toBe(true)
    expect(isWithinRange(y, 3, 1)).toBe(true)
    expect(isWithinRange(z, 4, 1)).toBe(true)
  })
})

describe('rgbToLAB', () => {
  test('correctly converts rgb to lab', () => {
    const {
      l: l1,
      a: a1,
      b: b1,
      alpha: alpha1,
    } = rgbToLAB(20, 120, 75, 1, 'D65', '1931')

    const {
      l: l2,
      a: a2,
      b: b2,
      alpha: alpha2,
    } = rgbToLAB(20, 120, 75, 1, 'D65', '1964')

    expect(isWithinRange(l1, 44, 1)).toBe(true)
    expect(isWithinRange(a1, -38, 1)).toBe(true)
    expect(isWithinRange(b1, 17, 1)).toBe(true)
    expect(alpha1).toBe(1)

    expect(isWithinRange(l2, 44, 1)).toBe(true)
    expect(isWithinRange(a2, -38, 1)).toBe(true)
    expect(isWithinRange(b2, 17, 1)).toBe(true)
    expect(alpha2).toBe(1)
  })
})
