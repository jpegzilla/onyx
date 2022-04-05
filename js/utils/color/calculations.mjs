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
} from './constants.mjs'

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
 * @param  {string} foreground a hex color.
 * @param  {string} background a hex color.
 * @return {object}            an object containing information
 *                             about the contrast between colors.
 */
export const getContrastRatio = (foreground, background) => {
  const foregroundRGB = hexToRGBA(foreground)
  const backgroundRGB = hexToRGBA(background)

  const wcagLevels = {
    fail: {
      range: [0, 3],
    },
    'aa Large': {
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

  return { number: contrastNum, string: contrastString, wcag }
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

  if (brightness > 125) return true
  if (brightness < 125) return false
}
