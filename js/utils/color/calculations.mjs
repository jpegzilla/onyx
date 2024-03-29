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
  ANGLE_HALF,
} from './constants.mjs'
import { hexToHSV, hslaToRGB, hsvToLab, hsvToRGB } from './conversions.mjs'

// luminance calculation based on this:
// https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
// which is also where these constants are from
/**
 * calculates the luminance of an rgb color in 8-bit integers.
 * @param  {number} r red, 0-255
 * @param  {number} g green, 0-255
 * @param  {number} b blue, 0-255
 * @return {number} luminance of the given color
 */
export const calculateLuminance = (r, g, b) => {
  if ([r, g, b].some(e => e > 255 || e < 0))
    throw new RangeError('rgb values must be in range 0-255.')
  if ([r, g, b].some(e => isNaN(e)))
    throw new TypeError('rgb values must be numerical.')

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
 * @param  {object} color  object containing the fg and bg colors.
 * @param  {string} format the format of the color.
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

/**
 * determines whether the background color of the element
 * provided is bright or dark.
 * @param  {HTMLElement} element html element to check
 * @return {Boolean}             true if the element is bright
 */
export const isElementBackgroundBright = element => {
  let elementRGB = getComputedStyle(element)['background-color']

  if (!elementRGB) elementRGB = element.style.backgroundColor

  elementRGB = elementRGB.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)

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

// TODO: this cannot be used yet. it's EXTREMELY slow, which is unfortunate
// because it's also crazy accurate for getting the distance between colors.

/**
 * calculate cielab delta e 2000 distance between lab colors
 * based on hajim.rochester.edu/ece/sites/gsharma/ciede2000/ciede2000noteCRNA.pdf
 * @param  {object} labColor1 lab color with l in range [0, 360]
 *                            and everything else in range [0, 1]
 * @param  {object} labColor2 lab color with l in range [0, 360]
 *                            and everything else in range [0, 1]
 * @return {number}           distance between colors
 *                            with four significant figures
 */
export const calculateCIEDE2000 = (labColor1, labColor2) => {
  const { l: l1, a: a1, b: b1 } = labColor1
  const { l: l2, a: a2, b: b2 } = labColor2
  const { PI, sqrt, atan2, sin, cos, pow, abs, exp } = Math

  const radToDeg = rad => (360 * rad) / (2 * PI)
  const degToRad = deg => (2 * PI * deg) / 360

  // constants
  const kL = 1
  const kC = 1
  const kH = 1

  const c1 = sqrt(pow(a1, 2) + pow(b1, 2))
  const c2 = sqrt(pow(a2, 2) + pow(b2, 2))

  const avgL = (l1 + l2) / 2
  const avgC = (c1 + c2) / 2

  const G = 0.5 * (1 - sqrt(pow(avgC, 7) / (pow(avgC, 7) + pow(25, 7))))

  // 1: calculate c1 / c2 prime, h1 / h2 prime
  const aPrime1 = (1 + G) * a1
  const aPrime2 = (1 + G) * a2
  const cPrime1 = sqrt(pow(aPrime1, 2) + pow(b1, 2))
  const cPrime2 = sqrt(pow(aPrime2, 2) + pow(b2, 2))

  // atan2 outputs radians, but the delta e 2000 equation requires degrees.
  let hPrime1 = radToDeg(atan2(b1, aPrime1))
  if (hPrime1 < 0) hPrime1 += ANGLE_MAX
  if (b1 == aPrime1 && aPrime1 == 0) hPrime1 = 0

  let hPrime2 = radToDeg(atan2(b2, aPrime2))
  if (hPrime2 < 0) hPrime2 += ANGLE_MAX
  if (b2 == aPrime2 && aPrime2 == 0) hPrime2 = 0

  const avgCPrime = (cPrime1 + cPrime2) / 2

  // 2: calculate delta C prime, delta C prime, and delta H prime
  const DeltaLPrime = l2 - l1
  const DeltaCPrime = cPrime2 - cPrime1

  let deltaHPrime // (precursory to delta capital H prime)

  if (abs(hPrime2 - hPrime1) <= ANGLE_HALF) deltaHPrime = hPrime2 - hPrime1
  if (hPrime2 - hPrime1 > ANGLE_HALF)
    deltaHPrime = hPrime2 - hPrime1 - ANGLE_MAX
  if (hPrime2 - hPrime1 < -ANGLE_HALF)
    deltaHPrime = hPrime2 - hPrime1 + ANGLE_MAX
  if (cPrime1 * cPrime2 === 0) deltaHPrime = 0

  const DeltaHPrime =
    // sin requires radians
    2 * sqrt(cPrime1 * cPrime2) * sin(degToRad(deltaHPrime / 2))

  // 3. calculate ciede2000 color-difference delta e 00
  let AvgHPrime // avg h prime, lowercase h

  if (abs(hPrime1 - hPrime2) <= ANGLE_HALF) AvgHPrime = (hPrime1 + hPrime2) / 2
  if (abs(hPrime1 - hPrime2) > ANGLE_HALF && hPrime1 + hPrime2 < ANGLE_MAX)
    AvgHPrime = (hPrime2 + hPrime1 + ANGLE_MAX) / 2
  if (abs(hPrime1 - hPrime2) > ANGLE_HALF && hPrime1 + hPrime2 >= ANGLE_MAX)
    AvgHPrime = (hPrime1 + hPrime2 - ANGLE_MAX) / 2
  if (cPrime1 * cPrime2 === 0) AvgHPrime = hPrime1 + hPrime2

  AvgHPrime = AvgHPrime

  // cos requires arguments in radians
  const T =
    1 -
    0.17 * cos(degToRad(AvgHPrime - 30)) +
    0.24 * cos(degToRad(AvgHPrime * 2)) +
    0.32 * cos(degToRad(AvgHPrime * 3 + 6)) -
    0.2 * cos(degToRad(AvgHPrime * 4 - 63))

  const sL = 1 + (0.015 * pow(avgL - 50, 2)) / sqrt(20 + pow(avgL - 50, 2))

  const sC = 1 + 0.045 * avgCPrime
  const sH = 1 + 0.015 * avgCPrime * T

  const deltaTheta = 30 * exp(-pow((AvgHPrime - 275) / 25, 2))
  const rC = 2 * sqrt(pow(avgCPrime, 7) / (pow(avgCPrime, 7) + pow(25, 7)))

  const rT =
    // sin requires radians
    -sin(2 * degToRad(deltaTheta)) * rC

  const deltaE = sqrt(
    pow(DeltaLPrime / (kL * sL), 2) +
      pow(DeltaCPrime / (kC * sC), 2) +
      pow(DeltaHPrime / (kH * sH), 2) +
      rT * (DeltaCPrime / (kC * sC)) * (DeltaHPrime / (kH * sH))
  )

  return deltaE
}

/**
 * calculates the redmean distance between two rgb colors
 * https://www.compuphase.com/cmetric.htm
 * @param  {object} color1 rgb color in range [0, 255]
 * @param  {object} color2 rgb color in range [0, 255]
 * @return {number}        distance between colors
 */
export const calculateRedmean = (color1, color2) => {
  const [r1, g1, b1] = color1.values
  const [r2, g2, b2] = color2.values

  const deltaR = r1 - r2
  const deltaG = g1 - g2
  const deltaB = b1 - b2
  const avgR = (r1 + r2) / 2

  const deltaC = Math.sqrt(
    (2 + avgR / 256) * Math.pow(deltaR, 2) +
      4 * Math.pow(deltaG, 2) +
      (2 + (255 - avgR / 256)) * Math.pow(deltaB, 2)
  )

  return deltaC
}

/**
 * measures the distance between two color coordinates in hsv
 * color space.
 * @param  {object} color          color to measure in hsv in [0, 1]
 * @param  {string} referenceColor color to compare with in hex
 * @return {number}                distance between two colors
 */
export const getColorDistance = (color, referenceColor, calculationForm) => {
  const { sin, cos, pow, sqrt, min, abs } = Math
  const { h, s, v } = color
  const { h: libH, s: libS, v: libV } = hexToHSV(referenceColor)

  const [h1, s1, v1] = [h * TAU, s, v]
  const [h2, s2, v2] = [libH * TAU, libS, libV]

  const refLab = hsvToLab({
    h: libH,
    s: libS,
    v: libV,
  })

  let distance

  switch (calculationForm.toLowerCase()) {
    case 'deltae2000':
      // dramatically slower than euclidean, but better measurement
      distance = calculateCIEDE2000(hsvToLab(color), refLab)
    case 'labdiff':
      // slightly slower than euclidean
      const { l: l1, a: a1, b: b1 } = hsvToLab(color)
      const { l: l2, a: a2, b: b2 } = refLab

      distance = pow(l1 - l2, 2) + pow(a1 - a2, 2) + pow(b1 - b2, 2)
    case 'hsvmetric':
      // maybe faster than euclidean?
      const dh = min(abs(libH - h), ANGLE_MAX - abs(libH - h)) / ANGLE_HALF
      const ds = abs(libS - s)
      const dv = abs(libV - v) / 255

      distance = sqrt(dh * dh + ds * ds + dv * dv)
    case 'redmean':
      // maybe slower than hsvMetric but fairly fast and more accurate?
      const rgb1 = hsvToRGB(color)
      const rgb2 = hsvToRGB({ h: libH, s: libS, v: libV })

      distance = calculateRedmean(rgb1, rgb2)
    case 'euclidean':
    default:
      distance =
        pow(sin(h1) * s1 * v1 - sin(h2) * s2 * v2, 2) +
        pow(cos(h1) * s1 * v1 - cos(h2) * s2 * v2, 2) +
        pow(v1 - v2, 2)
  }

  return distance
}

/**
 * given an hsl color in {h, s, v} format and an array of objects
 * containing several colors in hex format, finds the closest
 * match for the hsl color in the array.
 * the distance function is
 * @arg {Object}   args - findClosestColor parameter
 * @arg {Object}   args.color - color in hsv format in [0, 1] range
 * @arg {Array}    args.library - list of colors to search
 * @param {string} type measurement type:
 *                      euclidean, labdiff, deltae2000, redmean, hsvmetric
 * @return {Object} closest match to given color from library
 */
export const findClosestColor = ({ color, library }, type = 'redmean') => {
  const { h, s, v } = color

  let lowestDistance = Infinity
  let closestColor

  let length = library.length
  for (let i = 0; i < length; i++) {
    const { hex } = library[i]

    const distance = getColorDistance({ h, s, v }, hex, type)
    // const distance = getColorDistance({ h, s, v }, hex, 'deltaE2000')

    if (distance < lowestDistance) {
      lowestDistance = distance
      closestColor = library[i]
    }
  }

  return closestColor
}

/**
 * calculate the perceptual lightness contrast between two colors
 * based on the apca contrast prediction equation
 * https://github.com/Myndex/apca-w3
 *
 * @param  {object} fgcolor   rgb foreground color object
 * @param  {number} fgcolor.r red number [0, 255]
 * @param  {number} fgcolor.g green number [0, 255]
 * @param  {number} fgcolor.b blue number [0, 255]
 * @param  {object} bgColor   rgb background color ojbect
 * @param  {number} bgColor.r red number [0, 255]
 * @param  {number} bgColor.g blue number [0, 255]
 * @param  {number} bgColor.b rgb background color ojbect
 * @return {number}          perceptual lightness contrast
 */
export const calculateAPCAContrast = (fgcolor, bgColor) => {
  const { pow, abs } = Math

  // powercurve exponents
  const S_TRC = 2.4
  const N_tx = 0.57
  const N_bg = 0.56
  const R_tx = 0.62
  const R_bg = 0.65

  // clamps and scalers
  const B_clip = 1.414
  const B_thrsh = 0.022
  const W_scale = 1.14
  const W_offset = 0.027
  const W_clamp = 0.1

  const { r: fgR, g: fgG, b: fgB } = fgcolor
  const { r: bgR, g: bgG, b: bgB } = bgColor

  const softClip = num => {
    if (num < 0) return 0
    if (num < B_thrsh) return num + pow(B_thrsh - num, B_clip)
    return num
  }

  // Ytxt
  const foregroundLuminance = softClip(
    pow(fgR / RGB_MAX, S_TRC) * 0.2126729 +
      pow(fgG / RGB_MAX, S_TRC) * 0.7151522 +
      pow(fgB / RGB_MAX, S_TRC) * 0.072175
  )

  // Ybg
  const backgroundLuminance = softClip(
    pow(bgR / RGB_MAX, S_TRC) * 0.2126729 +
      pow(bgG / RGB_MAX, S_TRC) * 0.7151522 +
      pow(bgB / RGB_MAX, S_TRC) * 0.072175
  )

  const backgroundDarkerThanForeground =
    backgroundLuminance > foregroundLuminance

  const S_apc = backgroundDarkerThanForeground
    ? (pow(backgroundLuminance, N_bg) - pow(foregroundLuminance, N_tx)) *
      W_scale
    : (pow(backgroundLuminance, R_bg) - pow(foregroundLuminance, R_tx)) *
      W_scale

  const calculateLightnessContrast = sapc => {
    if (abs(sapc) < W_clamp) return 0
    if (sapc > 0) return (sapc - W_offset) * 100
    if (sapc < 0) return (sapc + W_offset) * 100
  }

  return calculateLightnessContrast(S_apc)
}
