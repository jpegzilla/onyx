import { rgbaToHSLA, hslaToRGB } from './conversions.mjs'

export const shiftHue = (rgb, deg) => {
  const { r, g, b, a } = rgb
  const { h, s, l } = rgbaToHSLA(r, g, b)

  if (deg > 100 || deg < 0)
    throw new RangeError(
      'amount of hue shifting in shiftHue must be within the range [0, 100].'
    )

  let hue = h + deg
  const saturation = parseInt(s) / 100
  const lightness = parseInt(l) / 100
  if (hue < 0) hue += 360
  if (hue > 360) hue -= 360
  hue /= 360

  return hslaToRGB(hue, saturation, lightness)
}

export const shiftHslHue = h => {
  let newHue = h

  if (newHue < 0) newHue += Math.ceil(-newHue / 360) * 360

  return newHue % 360
}

// function to change color's saturation
export const shiftSat = (rgb, deg) => {
  const hsl = rgbaToHSLA(rgb.r, rgb.g, rgb.b)

  if (Math.abs(deg) > 100)
    throw new RangeError(
      'amount of hue shifting in shiftHue must be within the range [-100, 100].'
    )

  hsl.s += deg
  if (hsl.s < 0) hsl.s += 100
  if (hsl.s > 100) hsl.s -= 100
  hsl.h /= 360
  hsl.s /= 100
  hsl.l /= 100

  return hslaToRGB(hsl.h, hsl.s, hsl.l)
}

// change hex color shade by amount
export const changeShade = (color, amount) => {
  let usePound = false

  if (color[0] == '#') {
    color = color.slice(1)
    usePound = true
  }

  const num = parseInt(color, 16)

  let r = (num >> 16) + amount

  if (r > 255) r = 255
  else if (r < 0) r = 0

  let b = ((num >> 8) & 0x00ff) + amount

  if (b > 255) b = 255
  else if (b < 0) b = 0

  let g = (num & 0x0000ff) + amount

  if (g > 255) g = 255
  else if (g < 0) g = 0

  return (
    (usePound ? '#' : '') +
    String('000000' + (g | (b << 8) | (r << 16)).toString(16)).slice(-6)
  )
}
