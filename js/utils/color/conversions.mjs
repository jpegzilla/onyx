import {
  RGB_MAX,
  LUM_DIVISOR_H,
  LUM_ADDEND,
  RGB_THRESHOLD,
  PI,
  CIE_1931_XYZ_REFERENCE,
  CIE_1964_XYZ_REFERENCE,
  ANGLE_MAX,
} from './constants.mjs'
import './../prototypeExtensions.mjs'

/**
 * convert a 3, 6. or 8-digit hex string to rgba
 * @param  {string} hex a string representing a hex code
 * @return {object}     an rgba color
 */
export const hexToRGBA = hex => {
  if (!hex || typeof hex != 'string' || hex.length < 3) return false
  if (hex.split('').indexOf('#') == 0) hex = hex.substring(1)

  const acceptableCharacters = /^(?:[0-9a-fA-F]{3,8})$/

  if (!hex.match(acceptableCharacters))
    throw new Error(`parameter '${hex}' is not a valid hex color.`)

  if (hex.length == 6) {
    const rgb = parseInt(hex, 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = rgb & 0xff

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('please enter rgb(a) values only between 0 and F.')
    }

    return { r, g, b, a: 1 }
  } else if (hex.length == 3) {
    hex.split('')
    hex = [hex[0], hex[0], hex[1], hex[1], hex[2], hex[2]]
    hex = '0x' + hex.join('')
    const rgb = parseInt(hex, 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = rgb & 0xff

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('please enter rgb(a) values only between 0 and F.')
    }

    return { r, g, b }
  } else if (hex.length == 8) {
    let a = hex.substring(6, 8)
    hex = hex.substring(0, 6)
    const rgb = parseInt(hex, 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = rgb & 0xff
    a = '0x' + a
    a = parseInt(a)

    if (isNaN(a) || isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('please enter rgb(a) values only between 0 and F.')
    }

    return { r, g, b, a }
  } else if (hex.length == 4) {
    let a = hex.substring(3, 4).split('')

    hex = hex.substring(0, 3).split('')
    hex = [hex[0], hex[0], hex[1], hex[1], hex[2], hex[2]]
    hex = '0x' + hex.join('')

    a = [a[0], a[0]]
    a = '0x' + a.join('')
    a = parseInt(a)

    const rgb = parseInt(hex, 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = rgb & 0xff

    if (isNaN(a) || isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('please enter rgb(a) values only between 0 and F.')
    }

    return { r: r, g: g, b: b, a: a }
  } else {
    throw new Error(`parameter '${hex}' is not valid.`)
  }
}

/**
 * converts normalized [0 - 1] hsl to rgb
 * @param  {number} h hue
 * @param  {number} s saturation
 * @param  {number} l lightness
 * @param  {number} a alpha
 * @return {object}   rgb color
 */
export const hslaToRGB = (h, s, l, a) => {
  let r, g, b

  if (s == 0) r = g = b = l
  else {
    const hueToRGB = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hueToRGB(p, q, h + 1 / 3)
    g = hueToRGB(p, q, h)
    b = hueToRGB(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a,
  }
}

/**
 * convert rgb in [0. 255] to hsl in [0, 360], [0, 100], [0, 100]
 * @param  {number} r number representing red
 * @param  {number} g number representing green
 * @param  {number} b number representing blue
 * @return {object}   hsl object
 */
export const rgbToNHSL = (r, g, b) => {
  const red = r / RGB_MAX
  const green = g / RGB_MAX
  const blue = b / RGB_MAX

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)

  let lum = (max + min) / 2
  let sat = 0
  let hue = 0
  if (max != min) {
    if (lum < 0.5) sat = (max - min) / (max + min)
    else sat = (max - min) / (2 - max - min)

    if (red == max) hue = (green - blue) / (max - min)
    else if (green == max) hue = 2 + (blue - red) / (max - min)
    else hue = 4 + (red - green) / (max - min)
  }

  lum = lum * 100
  sat = sat * 100
  hue = hue * 60

  // if hue is less than zero, wrap it around to be back in range
  if (hue < 0) hue += ANGLE_MAX

  return {
    h: hue,
    s: sat,
    l: lum,
  }
}

/**
 * converts rgba in [0, 255] to hsla object
 * @param  {number} r number representing red
 * @param  {number} g number representing green
 * @param  {number} b number representing blue
 * @param  {number} a number representing alpha
 * @return {object} hsla object
 */
export const rgbaToHSLA = (r, g, b, a) => {
  const red = r / RGB_MAX
  const green = g / RGB_MAX
  const blue = b / RGB_MAX

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)

  let l = (max + min) / 2
  let s = 0
  let h = 0
  if (max != min) {
    if (l < 0.5) s = (max - min) / (max + min)
    else s = (max - min) / (2 - max - min)

    if (red == max) h = (green - blue) / (max - min)
    else if (green == max) h = 2 + (blue - red) / (max - min)
    else h = 4 + (red - green) / (max - min)
  }

  l = l * 100
  s = s * 100
  h = h * 60
  if (h < 0) h += ANGLE_MAX

  return {
    h,
    s: +s,
    l: +l,
    a,
  }
}

/**
 * converts a hex string to an hsla object
 * @param  {string} hex hex string
 * @return {object}     hsla object
 */
export const hexToHSLA = hex => {
  const { r, g, b, a } = hexToRGBA(hex)

  return rgbaToHSLA(r, g, b, a)
}

/**
 * converts hsv to hsl
 * @param  {object} hsv hsv color in range [0, 1]
 * @return {object}     hsl object
 */
export const hsvToHSL = hsv => {
  const { h, s, v } = hsv

  const l = v * (1 - s / 2)
  const hslS = l === 0 ? 0 : (v - l) / Math.min(1, 1 - l)

  return {
    h,
    s: hslS,
    l,
  }
}

// returns h, s, and l in the set [0, 1]
export const rgbToDHSL = (r, g, b) => {
  const red = r / RGB_MAX
  const green = g / RGB_MAX
  const blue = b / RGB_MAX

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  let hue, sat
  const lum = (max + min) / 2

  if (max == min) hue = sat = 0
  else {
    const delta = max - min

    sat = lum > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0)
        break
      case green:
        hue = (blue - red) / delta + 2
        break
      case blue:
        hue = (red - green) / delta + 4
        break
    }

    hue /= 6
  }

  return { h: hue, s: sat, l: lum }
}

export const hexToHWB = hex => {
  const { r, g, b, a } = hexToRGBA(hex)
  const { s, l } = rgbToDHSL(r, g, b)
  const { h } = rgbaToHSLA(r, g, b, a)

  const value = l + s * Math.min(l, 1 - l)
  const delta = value === 0 ? 0 : 2 - (2 * l) / value
  const white = (1 - delta) * value * 100
  const black = (1 - value) * 100

  return {
    h: +h,
    w: +white,
    b: +black,
    a,
  }
}

export const hslaToHWB = hsl => {
  const { h: nh, s: ns, l: nl, a: na } = hsl
  const { r, g, b, a } = hslaToRGB(nh / ANGLE_MAX, ns / 100, nl / 100, na)

  const { s, l } = rgbToDHSL(r, g, b)
  const { h } = rgbaToHSLA(r, g, b, a)

  const value = l + s * Math.min(l, 1 - l)
  const delta = value === 0 ? 0 : 2 - (2 * l) / value
  const white = (1 - delta) * value * 100
  const black = (1 - value) * 100

  return {
    h: +h,
    w: +white,
    b: +black,
    a,
  }
}

export const rgbToXYZ = (red, green, blue) => {
  let r = red / 255
  let g = green / 255
  let b = blue / 255

  if (r > RGB_THRESHOLD) r = ((r + LUM_ADDEND) / 1.055) ** 2.4
  else r = r / LUM_DIVISOR_H
  if (g > RGB_THRESHOLD) g = ((g + LUM_ADDEND) / 1.055) ** 2.4
  else g = g / LUM_DIVISOR_H
  if (b > RGB_THRESHOLD) b = ((b + LUM_ADDEND) / 1.055) ** 2.4
  else b = b / LUM_DIVISOR_H

  r = r * 100
  g = g * 100
  b = b * 100

  const x = r * 0.4124 + g * 0.3576 + b * 0.1805
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505

  return { x, y, z }
}

/**
 * converts rgb color to lab color
 * @param  {number}  red    red number of rgb color
 * @param  {number}  green  green number of rgb color
 * @param  {number}  blue   blue number of rgb color
 * @param  {number}  alpha  alpha number of color
 * @param  {string}  type   white type ex. d65
 * @param  {string}  cieRef cie ref code
 * @param  {boolean} lIn100 should l be normalized to [0, 100]?
 * @return {object}         lab color
 */
export const rgbToLAB = (
  red,
  green,
  blue,
  alpha,
  type,
  cieRef,
  lIn100 = false
) => {
  const { x, y, z } = rgbToXYZ(red, green, blue)

  let standardX = x / CIE_1931_XYZ_REFERENCE[type][0]
  let standardY = y / CIE_1931_XYZ_REFERENCE[type][1]
  let standardZ = z / CIE_1931_XYZ_REFERENCE[type][2]

  if (cieRef === '1964') {
    standardX = x / CIE_1964_XYZ_REFERENCE[type][0]
    standardY = y / CIE_1964_XYZ_REFERENCE[type][1]
    standardZ = z / CIE_1964_XYZ_REFERENCE[type][2]
  }

  if (standardX > 0.008856) standardX = standardX ** (1 / 3)
  else standardX = 7.787 * standardX + 16 / 116
  if (standardY > 0.008856) standardY = standardY ** (1 / 3)
  else standardY = 7.787 * standardY + 16 / 116
  if (standardZ > 0.008856) standardZ = standardZ ** (1 / 3)
  else standardZ = 7.787 * standardZ + 16 / 116

  const l = 116 * standardY - 16
  const a = 500 * (standardX - standardY)
  const b = 200 * (standardY - standardZ)

  return {
    l: lIn100 ? l * 100 : l,
    a: a,
    b: b,
    alpha,
  }
}

export const hslaToLAB = (
  hsla,
  type = 'D65',
  cieRef = '1931',
  lIn100 = false
) => {
  const { h, s, l, a } = hsla
  const { r, g, b } = hslaToRGB(h / ANGLE_MAX, s / 100, l / 100, a)

  return rgbToLAB(r, g, b, a, type, cieRef, lIn100)
}

/**
 * converts hsv color with elements in range [0, 1] [0, 1] [0, 1]
 * to an rgb number
 * @param  {object} hsv hsv color
 * @return {object}     rgb color
 */
export const hsvToRGB = hsv => {
  let r, g, b

  const { h, s, v } = hsv
  const chroma = v * s
  const hPrime = h / 60
  const x = chroma * (1 - Math.abs((hPrime % 2) - 1))
  const m = v - chroma

  switch (true) {
    case hPrime.between(0, 1, false, true):
      r = chroma
      g = x
      b = 0
      break
    case hPrime.between(1, 2, false, true):
      r = x
      g = chroma
      b = 0
      break
    case hPrime.between(2, 3, false, true):
      r = 0
      g = chroma
      b = x
      break
    case hPrime.between(3, 4, false, true):
      r = 0
      g = x
      b = chroma
      break
    case hPrime.between(4, 5, false, true):
      r = x
      g = 0
      b = chroma
      break
    case hPrime.between(5, 6, false, true):
      r = chroma
      g = 0
      b = x
      break
  }

  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  }
}

/**
 * converts an hsv color in range [0, 1] to a cielab color
 * @param  {object} hsv hsv color object
 * @return {object}     cielab color object
 */
export const hsvToLab = hsv => {
  const { h, s, l, a } = hsvToHSL(hsv)

  return hslaToLAB(
    {
      h: h * 100,
      s: s,
      l: l,
      a: a || 1,
    },
    undefined,
    undefined,
    true
  )
}

/**
 * convert hsla color in range [0, 360] [0, 100] [0, 100]
 * to an xyz color
 * @param  {object} hsla hsla color object
 * @return {object}      xyz color
 */
export const hslaToXYZ = hsla => {
  const { h, s, l, a } = hsla
  const { r, g, b } = hslaToRGB(h / ANGLE_MAX, s / 100, l / 100, a)
  const { x, y, z } = rgbToXYZ(r, g, b)

  return {
    x,
    y,
    z,
  }
}

// correct
export const labToXYZ = lab => {
  const { pow } = Math
  const { l, a, b } = lab

  const Xref = CIE_1931_XYZ_REFERENCE.D65[0]
  const Yref = CIE_1931_XYZ_REFERENCE.D65[1]
  const Zref = CIE_1931_XYZ_REFERENCE.D65[2]

  const kappa = 903.3
  const epsilon = 0.008856

  const fy = (l + 16) / 116
  const fx = a / 500 + fy
  const fz = fy - b / 200

  const x = pow(fx, 3) > epsilon ? pow(fx, 3) : (116 * fx - 16) / kappa
  const y = l > kappa * epsilon ? pow((l + 16) / 116, 3) : l / kappa
  const z = pow(fz, 3) > epsilon ? pow(fz, 3) : (116 * fz - 16) / kappa

  return {
    x: x * Xref,
    y: y * Yref,
    z: z * Zref,
  }
}

export const xyzToRGB = xyz => {
  const { pow, round } = Math
  const x = xyz.x / 100
  const y = xyz.y / 100
  const z = xyz.z / 100
  const rLinear = x * 3.2406 + y * -1.5372 + z * -0.4986
  const gLinear = x * -0.9689 + y * 1.8758 + z * 0.0415
  const bLinear = x * 0.0557 + y * -0.204 + z * 1.057

  const threshold = 0.0031308
  const gammaCorrect = c =>
    c <= threshold ? 12.92 * c : 1.055 * pow(c, 1 / 2.4) - 0.055

  const r = gammaCorrect(rLinear)
  const g = gammaCorrect(gLinear)
  const b = gammaCorrect(bLinear)

  return { r: round(r * 255), g: round(g * 255), b: round(b * 255) }
}

/**
 * converts a hex color to an xyz color
 * @param  {string} hex             hex string
 * @param  {string} [type='D65']    white point type
 * @param  {string} [cieRef='1931'] cie reference year
 * @return {object}                 xyz color object
 */
export const hexToLAB = (hex, type = 'D65', cieRef = '1931') => {
  const { r, g, b, a } = hexToRGBA(hex)

  return rgbToLAB(r, g, b, a, type, cieRef)
}

export const hexToXYZ = hex => {
  const { r, g, b } = hexToRGBA(hex)
  const { x, y, z } = rgbToXYZ(r, g, b)

  return {
    x: x,
    y: y,
    z: z,
  }
}

/**
 * convert a lab color to an lch color
 * @param  {number} l     l number
 * @param  {number} a     a number
 * @param  {number} b     b number
 * @param  {number} alpha alpha number
 * @return {object}       lch object
 */
export const labToLCH = (l, a, b, alpha) => {
  let h = Math.atan2(b, a)
  if (h > 0) h = (h / PI) * 180
  else h = ANGLE_MAX - (Math.abs(h) / PI) * 180

  return {
    l,
    c: Math.hypot(a, b),
    h: h,
    a: alpha,
  }
}

/**
 * convert an lch color to a lab color.
 * @param  {number} l               [description]
 * @param  {number} c               [description]
 * @param  {number} h               [description]
 * @return {object}   lab color
 */
export const lchToLab = lch => {
  const { l, c, h } = lch
  const { PI, sin, cos } = Math

  // const radToDeg = rad => (360 * rad) / (2 * PI)
  const degToRad = deg => (2 * PI * deg) / 360
  const a = +c * cos(degToRad(+h))
  const b = +c * sin(degToRad(+h))

  return {
    l,
    a,
    b,
  }
}

export const lchToHsl = lch => {
  const lab = lchToLab(lch)
  const xyz = labToXYZ(lab)
  const rgb = xyzToRGB(xyz)

  return rgbaToHSLA(...rgb.values)
}

/**
 * converts an hsla color to a cielch color
 * @param  {object} hsla hsla color
 * @return {object}      lch color
 */
export const hslaToLCH = hsla => {
  const { l, a, b, alpha } = hslaToLAB(hsla)

  return labToLCH(l, a, b, alpha)
}

/**
 * converts hex string to lch via lab.
 * @param  {string} hex hex string to convert.
 * @return {object}     lch object
 */
export const hexToLCH = hex => {
  const { l, a, b, a: alpha } = hexToLAB(hex)

  return labToLCH(l, a, b, alpha)
}

/**
 * converts a hex string to hsv via rgba.
 * @param  {string}  hex        hex string to convert.
 * @param  {boolean} normalized normalizes to [0, 1] if true
 * @return {object}             hsv with all elements in range [0, 1].
 *                              or [0, 360], [0, 100], [0, 100]
 *                              if normalize is false
 */
export const hexToHSV = (hex, normalized = true) => {
  const { r, g, b } = hexToRGBA(hex)

  let red = r / 255
  let green = g / 255
  let blue = b / 255

  const minRGBValue = Math.min(red, green, blue)
  const maxRGBValue = Math.max(red, green, blue)
  const deltaRGB = maxRGBValue - minRGBValue

  const v = maxRGBValue
  let h = 0,
    s = 0

  if (deltaRGB === 0) {
    // gray
    h = 0
    s = 0
  } else {
    s = deltaRGB / maxRGBValue

    const deltaR = ((maxRGBValue - red) / 6 + deltaRGB / 2) / deltaRGB
    const deltaG = ((maxRGBValue - green) / 6 + deltaRGB / 2) / deltaRGB
    const deltaB = ((maxRGBValue - blue) / 6 + deltaRGB / 2) / deltaRGB

    if (red === maxRGBValue) h = deltaB - deltaG
    else if (green === maxRGBValue) h = 1 / 3 + deltaR - deltaB
    else if (blue === maxRGBValue) h = 2 / 3 + deltaG - deltaR

    if (h < 0) h += 1
    if (h > 1) h -= 1
  }

  if (normalized) {
    return { h, s, v }
  }

  return {
    h: h * 360,
    s: s * 100,
    v: v * 100,
  }
}

/**
 * converts an hsl color to an hsv color
 * @param  {object} hsl hsl color
 * @return {object}     hsv color
 */
export const hslToHSV = hsl => {
  const { h, s, l } = hsl
  const val = l + s * Math.min(l, 1 - l)
  const sat = val === 0 ? 0 : 2 * (1 - l / val)

  return {
    h,
    s: sat,
    v: val,
  }
}

/**
 * converts a hex color to an rgba color with all elements in range [0, 1]
 * @param  {string} hex hex color
 * @return {object}     rgba color
 */
export const hexToNRGBA = hex => {
  const { r, g, b, a } = hexToRGBA(hex)

  return {
    nR: r / 255,
    nG: g / 255,
    nB: b / 255,
    nA: a,
  }
}

/**
 * converts an hsla color to an rgba color with all elements in range [0, 1]
 * @param  {object} hsla hsla color
 * @return {object}      rgba color
 */
export const hslaToNRGBA = hsla => {
  const { h, s, l, a } = hsla
  const {
    h: dh,
    s: ds,
    l: dl,
  } = {
    h: h / ANGLE_MAX,
    s: s / 100,
    l: l / 100,
  }

  const { r, g, b } = hslaToRGB(dh, ds, dl)

  return {
    nR: r / 255,
    nG: g / 255,
    nB: b / 255,
    nA: a || 1.0,
  }
}

/**
 * converts an rgba color with elements in range [0, 255] to a hex color
 * @param  {object} rgba rgba color
 * @return {string}      hex color
 */
export const rgbaToHex = rgba => {
  const { r, g, b } = rgba

  return `${(r | (1 << 8)).toString(16).slice(1)}${(g | (1 << 8))
    .toString(16)
    .slice(1)}${(b | (1 << 8)).toString(16).slice(1)}`
}

/**
 * converts a hex color with elements in range [0, 360] [0, 100] [0, 100]
 * to a hex color
 * @param  {object} hsl hsl color
 * @return {string}     hex color
 */
export const hslToHex = hsl => {
  const { h, s, l } = hsl
  const dhsl = {
    h: h / ANGLE_MAX,
    s: s / 100,
    l: l / 100,
  }

  const rgb = hslaToRGB(...Object.values(dhsl))

  return `#${rgbaToHex(rgb)}`
}

/**
 * turns an hsl object with an alpha number into a string formatted like:
 * hsla(h s l / a) or hsl(h, s, l) when not given an alpha number
 * @param  {object} hsl   hsl object
 * @param  {number} hsl.h hue number
 * @param  {number} hsl.s saturation number
 * @param  {number} hsl.l lightness number
 * @param  {number} alpha alpha number
 * @return {string}       hsl represented as a string
 */
export const stringifyHSL = ({ h, s, l }, alpha) =>
  alpha ? `hsla(${h} ${s}% ${l}% / ${alpha})` : `hsl(${h}, ${s}%, ${l}%)`

/**
 * inverts the hue of an hsl color object
 * @param  {object} hsl   hsl object
 * @param  {number} hsl.h hue number
 * @param  {number} hsl.s saturation number
 * @param  {number} hsl.l lightness number
 * @return {object}       inverted hsl color
 */
export const invertHSL = ({ h, s, l }) => ({
  h: Math.abs(h - ANGLE_MAX),
  s,
  l,
})

/**
 * converts an xyz color (with D65 whitepoint and white as y=100) to oklab
 * @param  {object} xyz
 * @param  {number} xyz.x x coordinate
 * @param  {number} xyz.y y coordinate
 * @param  {number} xyz.z z coordinate
 * @return {object} oklab color
 */
export const xyzToOklab = xyz => {
  const { cbrt } = Math

  const x = xyz.x / 100
  const y = xyz.y / 100
  const z = xyz.z / 100

  // convert to lms color space
  const l = x * 0.8189330101 + y * 0.3618667424 + z * -0.1288597137
  const m = x * 0.0329845436 + y * 0.9293118715 + z * 0.0361456387
  const s = x * 0.0482003018 + y * 0.2643662691 + z * 0.633851707

  const lPrime = cbrt(l)
  const mPrime = cbrt(m)
  const sPrime = cbrt(s)

  const L =
    lPrime * 0.2104542553 + mPrime * 0.793617785 + sPrime * -0.0040720468
  const a =
    lPrime * 1.9779984951 + mPrime * -2.428592205 + sPrime * 0.4505937099
  const b =
    lPrime * 0.0259040371 + mPrime * 0.7827717662 + sPrime * -0.808675766

  return { l: L, a, b }
}
