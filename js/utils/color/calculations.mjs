import {
  LUM_LOWER,
  LUM_DIVISOR_H,
  LUM_ADDEND,
  LUM_DIVISOR_L,
  LUM_EXP,
  LUM_COEFF,
  LUM_R_ADDEND,
  LUM_G_ADDEND,
  RGB_MAX,
  BRIGHTNESS,
  TAU,
  MODE_HSL,
  ANGLE_MAX,
} from './constants.mjs'
import { hexToHSV, hslaToRGB } from './conversions.mjs'

// luminance calculation based on this:
// https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
// which is also where these constants are from
export const calculateLuminance = (r, g, b) => {
  const srgb = [r, g, b].map(val => val / RGB_MAX)
  const [R, G, B] = srgb.map(val =>
    val <= LUM_LOWER
      ? val / LUM_DIVISOR_H
      : ((val + LUM_ADDEND) / LUM_DIVISOR_L) ** LUM_EXP
  )

  const L = LUM_COEFF * R + LUM_R_ADDEND * G + LUM_G_ADDEND * B

  return L
}

/**
 * determines the contrast ratio between two colors
 * @param  {string} foreground an hsl color.
 * @param  {string} background an hsl color.
 * @return {object} an object containing information about the contrast between colors.
 */
export const getContrastRatio = (color, format) => {
  let foreground, background
  const { fg, bg } = color

  switch (format) {
    case MODE_HSL:
      foreground = {
        h: fg.h / ANGLE_MAX,
        s: fg.s / 100,
        l: fg.l / 100,
        a: fg.a,
      }
      background = {
        h: bg.h / ANGLE_MAX,
        s: bg.s / 100,
        l: bg.l / 100,
        a: bg.a,
      }
  }

  const foregroundRGB = hslaToRGB(...foreground.values)
  const backgroundRGB = hslaToRGB(...background.values)

  const wcagLevels = {
    fail: {
      range: [0, 3],
    },
    'aa large': {
      range: [3, 4.5],
    },
    aa: {
      range: [4.5, 7],
    },
    aaa: {
      range: [7, 22],
    },
  }

  const lum1 = calculateLuminance(
    foregroundRGB.r,
    foregroundRGB.g,
    foregroundRGB.b
  )
  const lum2 = calculateLuminance(
    backgroundRGB.r,
    backgroundRGB.g,
    backgroundRGB.b
  )

  const light = Math.max(lum1, lum2)
  const dark = Math.min(lum1, lum2)

  const contrast = (light + 0.05) / (dark + 0.05)
  const contrastNum = Math.floor(contrast * 100) / 100

  const contrastString = `${(light + 0.05).toFixed(2)}:${(dark + 0.05).toFixed(
    2
  )}`

  const wcag = Object.entries(wcagLevels).find(
    ([, v]) => v.range[0] <= contrastNum && v.range[1] >= contrastNum
  )

  return {
    number: contrastNum,
    string: contrastString,
    wcag,
    luminance: {
      fg: lum1,
      bg: lum2,
    },
  }
}

// determine whether the text in the
// element should be black or white
export const isElementBackgroundBright = element => {
  const elementRGB = getComputedStyle(element)['background-color'].match(
    /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/
  )

  const background = {
    r: elementRGB[1],
    g: elementRGB[2],
    b: elementRGB[3],
  }

  const brightness =
    parseInt(background.r) * BRIGHTNESS.R +
    parseInt(background.g) * BRIGHTNESS.G +
    parseInt(background.b) * BRIGHTNESS.B

  return brightness >= 125
}

/**
 * given an hsl color in {h, s, v} format and an array of objects
 * containing several colors in hex format, finds the closest
 * match for the hsl color in the array.
 * @arg {Object} args - findClosestColor parameter
 * @arg {Object} args.color - color in hsv format
 * @arg {Array} args.library - list of colors to search
 * @return {Object} closest match to given color from library
 */
export const findClosestColor = ({ color, library }) => {
  const { sin, cos, pow } = Math

  const { h, s, v } = color

  let lowestDistance = Infinity
  let closestColor

  for (const libColor of library) {
    const { hex } = libColor

    const { h: libH, s: libS, v: libV } = hexToHSV(hex)

    const [h1, s1, v1] = [h * TAU, s, v]
    const [h2, s2, v2] = [libH * TAU, libS, libV]

    const distance =
      pow(sin(h1) * s1 * v1 - sin(h2) * s2 * v2, 2) +
      pow(cos(h1) * s1 * v1 - cos(h2) * s2 * v2, 2) +
      pow(v1 - v2, 2)

    if (distance < lowestDistance) {
      lowestDistance = distance
      closestColor = libColor
    }
  }

  return closestColor
}

/**
 * measures the distance between two color coordinates in hsv
 * color space.
 * @param  {object} color          color to measure in hsv
 * @param  {string} referenceColor color to compare with in hex
 * @return {number}                distance between two colors
 */
export const getColorDistance = (color, referenceColor) => {
  const { sin, cos, pow } = Math
  const { h, s, v } = color
  const { h: libH, s: libS, v: libV } = hexToHSV(referenceColor)

  const [h1, s1, v1] = [h * TAU, s, v]
  const [h2, s2, v2] = [libH * TAU, libS, libV]

  const distance =
    pow(sin(h1) * s1 * v1 - sin(h2) * s2 * v2, 2) +
    pow(cos(h1) * s1 * v1 - cos(h2) * s2 * v2, 2) +
    pow(v1 - v2, 2)

  return distance
}
