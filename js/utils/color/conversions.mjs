import {
  RGB_MAX,
  LUM_DIVISOR_H,
  LUM_ADDEND,
  RGB_THRESHOLD,
  PI,
  CIE_1931_XYZ_REFERENCE,
} from './constants.mjs'

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
 * convert rgb in [0. 255] to hsl in [0, 360]
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
  if (hue < 0) hue += 360

  return {
    h: hue,
    s: sat,
    l: lum,
  }
}

/**
 * converts rgba in [0, 255] to hsla object
 * @param  {[type]} r number representing red
 * @param  {[type]} g number representing green
 * @param  {[type]} b number representing blue
 * @param  {[type]} a number representing alpha
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
  if (h < 0) h += 360

  return {
    h,
    s: +s.toFixed(2),
    l: +l.toFixed(2),
    a,
  }
}

export const hexToHSLA = hex => {
  const { r, g, b, a } = hexToRGBA(hex)

  return rgbaToHSLA(r, g, b, a)
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

// convert number literal to hex string
export const numToHex = num => {
  return isNaN(num)
    ? '00'
    : hexDigits[(num - (num % 16)) / 16] + hexDigits[num % 16]
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
    w: white.toFixed(2),
    b: black.toFixed(2),
    a,
  }
}

export const hslaToHWB = hsl => {
  const { h: nh, s: ns, l: nl, a: na } = hsl
  const { r, g, b, a } = hslaToRGB(nh / 360, ns / 100, nl / 100, na)

  const { s, l } = rgbToDHSL(r, g, b)
  const { h } = rgbaToHSLA(r, g, b, a)

  const value = l + s * Math.min(l, 1 - l)
  const delta = value === 0 ? 0 : 2 - (2 * l) / value
  const white = (1 - delta) * value * 100
  const black = (1 - value) * 100

  return {
    h: +h,
    w: white.toFixed(2),
    b: black.toFixed(2),
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

export const rgbToLAB = (red, green, blue, alpha, type, cieRef) => {
  const { x, y, z } = rgbToXYZ(red, green, blue)

  let standardX = x / CIE_1931_XYZ_REFERENCE[type][0]
  let standardY = y / CIE_1931_XYZ_REFERENCE[type][1]
  let standardZ = z / CIE_1931_XYZ_REFERENCE[type][2]

  if (cieRef === '1964') {
    standardX = x / CIE_1931_XYZ_REFERENCE[type][0]
    standardY = y / CIE_1931_XYZ_REFERENCE[type][1]
    standardZ = z / CIE_1931_XYZ_REFERENCE[type][2]
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

  return { l: l.toFixed(2), a: a.toFixed(2), b: b.toFixed(2), alpha }
}

export const hslaToLAB = (hsla, type = 'D65', cieRef = '1931') => {
  const { h, s, l, a } = hsla
  const { r, g, b } = hslaToRGB(h / 360, s / 100, l / 100, a)

  return rgbToLAB(r, g, b, a, type, cieRef)
}

export const hslaToXYZ = hsla => {
  const { h, s, l, a } = hsla
  const { r, g, b } = hslaToRGB(h / 360, s / 100, l / 100, a)
  const { x, y, z } = rgbToXYZ(r, g, b)

  return {
    x: x.toFixed(2),
    y: y.toFixed(2),
    z: z.toFixed(2),
  }
}

export const hexToLAB = (hex, type = 'D65', cieRef = '1931') => {
  const { r, g, b, a } = hexToRGBA(hex)

  return rgbToLAB(r, g, b, a, type, cieRef)
}

export const hexToXYZ = hex => {
  const { r, g, b } = hexToRGBA(hex)
  const { x, y, z } = rgbToXYZ(r, g, b)

  return {
    x: x.toFixed(2),
    y: y.toFixed(2),
    z: z.toFixed(2),
  }
}

export const labToLCH = (l, a, b, alpha) => {
  let h = Math.atan2(b, a)
  if (h > 0) h = (h / PI) * 180
  else h = 360 - (Math.abs(h) / PI) * 180

  return {
    l: parseInt(l).toFixed(2),
    c: Math.hypot(a, b).toFixed(2),
    h: h.toFixed(2),
    a: alpha,
  }
}

export const hslaToLCH = hsla => {
  const { l, a, b, alpha } = hslaToLAB(hsla)

  return labToLCH(l, a, b, alpha)
}

export const hexToLCH = hex => {
  const { l, a, b, a: alpha } = hexToLAB(hex)

  return labToLCH(l, a, b, alpha)
}

export const hexToHSV = hex => {
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

  return { h, s, v }
}

export const hslToHSV = ({ h, s, l }) => {
  const ds = s / 100
  const dl = l / 100

  const val = dl + ds * Math.min(dl, 1 - dl)
  const sat = val === 0 ? 0 : 2 * (1 - dl / val)

  return {
    h,
    s: sat,
    v: val,
  }
}

export const hexToNRGBA = hex => {
  const { r, g, b, a } = hexToRGBA(hex)

  return {
    nR: (r / 255).toFixed(2),
    nG: (g / 255).toFixed(2),
    nB: (b / 255).toFixed(2),
    nA: a.toFixed(2),
  }
}

export const hslaToNRGBA = hsla => {
  const { h, s, l, a } = hsla
  const {
    h: dh,
    s: ds,
    l: dl,
  } = {
    h: h / 360,
    s: s / 100,
    l: l / 100,
  }

  const { r, g, b } = hslaToRGB(dh, ds, dl)

  return {
    nR: (r / 255).toFixed(2),
    nG: (g / 255).toFixed(2),
    nB: (b / 255).toFixed(2),
    nA: a.toFixed(2),
  }
}

export const rgbaToHex = rgba => {
  const { r, g, b } = rgba

  return `${(r | (1 << 8)).toString(16).slice(1)}${(g | (1 << 8))
    .toString(16)
    .slice(1)}${(b | (1 << 8)).toString(16).slice(1)}`
}

export const hslToHex = ({ h, s, l }) => {
  const dhsl = {
    h: h / 360,
    s: s / 100,
    l: l / 100,
  }

  const rgb = hslaToRGB(...Object.values(dhsl))

  return `#${rgbaToHex(rgb)}`
}

export const stringifyHSL = ({ h, s, l }) => `hsl(${h}, ${s}%, ${l}%)`
