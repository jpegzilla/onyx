let FANCY_COLOR_NAMES = false

let CURRENT_ERR = ''

let colorHistory = []
let colorHistoryIndex = 0
let initialColorHistory = true

let textLocked = false
let bgLocked = false

let initColors = { background: '#50c878', text: '#eaeaea' }

let currentColors = { background: '#50c878', text: '#eaeaea' }

const backgroundShades = document.getElementsByClassName(
  'bg-shades-container'
)[0]
const textShades = document.getElementsByClassName('text-shades-container')[0]

const hexToColorName = (colors, hex) =>
  Object.keys(colors).find(key => colors[key] === hex)

const rgbToHex = (r, g, b) => `#${hex(r)}${hex(g)}${hex(b)}`

const hexDigits = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
]

// this is an unfinished function meant to find a close aaa approximation to the provided colors.
// this would be used to display the closest known aaa color combination for any pair.
export const findNearestAAAColor = (background, text, nearestTo = 'text') => {
  // get current contrast ratio
  let currCr = getContrastRatio(text, background).number
  // return same colors if it's already a ratio >= 7
  if (currCr >= 7) return { background: background, text: text }

  let nearestAAAColor
  // get rgb values for background and foreground
  background = text.replace(/^\s*#|\s*$/g, '')
  text = text.replace(/^\s*#|\s*$/g, '')

  // function to change the brightness of a color

  const changeBrightness = (hex, percent) => {
    let r = parseInt(hex.substring(0, 2), 16),
      g = parseInt(hex.substring(2, 4), 16),
      b = parseInt(hex.substring(4), 16)

    return (
      '#' +
      (0 | ((1 << 8) + r + ((256 - r) * percent) / 100))
        .toString(16)
        .substring(1) +
      (0 | ((1 << 8) + g + ((256 - g) * percent) / 100))
        .toString(16)
        .substring(1) +
      (0 | ((1 << 8) + b + ((256 - b) * percent) / 100))
        .toString(16)
        .substring(1)
    )
  }

  changeBrightness(background, 10)

  // get brightness of both colors

  // if contrast ratio is not aaa... (nearestTo is the color that will be changed)

  while (currCr < 7) {
    break
  }

  return nearestTo == 'background'
    ? { background: nearestAAAColor, text: text }
    : { background: background, text: nearestAAAColor }
}

export { colorSchemeToUse } from './prefersColorScheme.mjs'
