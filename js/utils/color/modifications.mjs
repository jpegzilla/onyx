import { rgbToNHSL, hslToRGB } from './conversions.mjs'

// function to change color's hue
export const shiftHue = (rgb, deg) => {
  const hsl = rgbToNHSL(rgb.r, rgb.g, rgb.b)

  if (deg > 100 || deg < 0)
    throw new RangeError(
      'amount of hue shifting in shiftHue must be within the range [0, 100].'
    )

  hsl.h += deg
  if (hsl.h < 0) hsl.h += 360
  if (hsl.h > 360) hsl.h -= 360
  hsl.h /= 360
  hsl.s /= 100
  hsl.l /= 100

  return hslToRGB(hsl.h, hsl.s, hsl.l)
}

// function to change color's saturation
export const shiftSat = (rgb, deg) => {
  const hsl = rgbToNHSL(rgb.r, rgb.g, rgb.b)

  if (deg > 100 || deg < -100)
    throw new RangeError(
      'amount of hue shifting in shiftHue must be within the range [-100, 100].'
    )

  hsl.s += deg
  if (hsl.s < 0) hsl.s += 100
  if (hsl.s > 100) hsl.s -= 100
  hsl.h /= 360
  hsl.s /= 100
  hsl.l /= 100

  return hslToRGB(hsl.h, hsl.s, hsl.l)
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
