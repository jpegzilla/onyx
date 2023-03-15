import {
  calculateLuminance,
  getContrastRatio,
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
