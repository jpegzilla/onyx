import {
  RGB_MAX,
  LUM_DIVISOR_H,
  LUM_ADDEND,
  XYZ_THRESHOLD,
  RGB_THRESHOLD,
  TAU,
} from './constants.mjs'

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

export const hslToRGB = (h, s, l) => {
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
  }
}

// rgb to NumberHSL
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
    if (lum < 0.5) s = (max - min) / (max + min)
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
    h: h.toFixed(2),
    s: s.toFixed(2) + '%',
    l: l.toFixed(2) + '%',
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

  if (max == min) h = s = 0
  else {
    const delta = max - min

    sat = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

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
  const { h, s, l } = rgbaToHSLA(r, g, b, a)
  const hwbH = parseInt(h)
  const hwbW = parseInt(s)
  const hwbV = parseInt(l)
  const hwbB = 100 - parseInt(hwbV)

  return { h: hwbH, w: `${hwbW}%`, b: `${hwbB}%`, a }
}

export const rgbToXYZ = (red, green, blue) => {
  let r = red / RGB_MAX,
    g = green / RGB_MAX,
    b = blue / RGB_MAX,
    x,
    y,
    z

  r =
    r > RGB_THRESHOLD
      ? Math.pow((r + LUM_ADDEND) / 1.055, 2.4)
      : r / LUM_DIVISOR_H
  g =
    g > RGB_THRESHOLD
      ? Math.pow((g + LUM_ADDEND) / 1.055, 2.4)
      : g / LUM_DIVISOR_H
  b =
    b > RGB_THRESHOLD
      ? Math.pow((b + LUM_ADDEND) / 1.055, 2.4)
      : b / LUM_DIVISOR_H

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  x = x > XYZ_THRESHOLD ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116
  y = y > XYZ_THRESHOLD ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116
  z = z > XYZ_THRESHOLD ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116

  return { x, y, z }
}

export const rgbToLAB = (r, g, b, a, trunc = true) => {
  const { x, y, z } = rgbToXYZ(r, g, b)

  if (trunc) {
    return {
      l: `${(116 * y - 16).toFixed(4)}%`,
      a: (500 * (x - y)).toFixed(4),
      b: (200 * (y - z)).toFixed(4),
      alpha: a,
    }
  }

  return {
    l: `${116 * y - 16}%`,
    a: 500 * (x - y),
    b: 200 * (y - z),
    alpha: a,
  }
}

export const hexToLAB = hex => {
  const { r, g, b, a } = hexToRGBA(hex)

  return rgbToLAB(r, g, b, a)
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

export const labToLCH = (l, a, b, alpha) => ({
  l,
  c: Math.hypot(a, b),
  h: (Math.atan2(b, a) * 360) / TAU,
  a: alpha,
})

export const hexToLCH = hex => {
  const { l, a, b, a: alpha } = hexToLAB(hex)

  return labToLCH(l, a, b, alpha)
}
