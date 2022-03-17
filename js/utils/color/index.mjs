let FANCY_COLOR_NAMES = false

let CURRENT_ERR = ''

const LUM_LOWER = 0.03928
const LUM_DIVISOR_H = 12.92
const LUM_DIVISOR_L = 1.055
const LUM_ADDEND = 0.055
const LUM_EXP = 2.4

const LUM_COEFF = 0.2126
const LUM_R_ADDEND = 0.7152
const LUM_G_ADDEND = 0.0722
const RGB_MAX = 255

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

const objectFlip = obj => {
  const ret = {}
  Object.keys(obj).forEach(key => {
    ret[obj[key]] = key
  })
  return ret
}

let cssColorNames

const setColorNames = () => {
  if (FANCY_COLOR_NAMES == true) {
    cssColorNames = objectFlip(colorLib)
  } else {
    cssColorNames = simpleColors
  }
}

setColorNames()

// usage: hexToColorName(cssColorNames, "#ffffff")

const hexToColorName = (colors, hex) =>
  Object.keys(colors).find(key => colors[key] === hex)

const hexToRGBA = hex => {
  if (!hex || typeof hex != 'string' || hex.length < 3) return false
  if (hex.split('').indexOf('#') == 0) hex = hex.substring(1)

  const acceptableCharacters = /^(?:[0-9a-fA-F]{3,8})$/

  if (!hex.match(acceptableCharacters))
    throw new Error(`parameter '${hex}' is not a valid hex color.`)

  if (hex.length == 6) {
    let rgb = parseInt(hex, 16)
    let r = (rgb >> 16) & 0xff
    let g = (rgb >> 8) & 0xff
    let b = rgb & 0xff

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('please enter rgb(a) values only between 0 and F.')
    }

    return { r, g, b }
  } else if (hex.length == 3) {
    hex.split('')
    hex = [hex[0], hex[0], hex[1], hex[1], hex[2], hex[2]]
    hex = '0x' + hex.join('')
    let rgb = parseInt(hex, 16)
    let r = (rgb >> 16) & 0xff
    let g = (rgb >> 8) & 0xff
    let b = rgb & 0xff

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('please enter rgb(a) values only between 0 and F.')
    }

    return { r, g, b }
  } else if (hex.length == 8) {
    let a = hex.substring(6, 8)
    hex = hex.substring(0, 6)
    let rgb = parseInt(hex, 16)
    let r = (rgb >> 16) & 0xff
    let g = (rgb >> 8) & 0xff
    let b = rgb & 0xff
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

    let rgb = parseInt(hex, 16)
    let r = (rgb >> 16) & 0xff
    let g = (rgb >> 8) & 0xff
    let b = rgb & 0xff

    if (isNaN(a) || isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('please enter rgb(a) values only between 0 and F.')
    }

    return { r: r, g: g, b: b, a: a }
  } else {
    throw new Error(`parameter '${hex}' is not valid.`)
  }
}

const hslToRGB = (h, s, l) => {
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

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s
    let p = 2 * l - q

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

// returns h, s, and l in the set [0, 1]
const rgbToDHSL = (r, g, b) => {
  ;(r /= 255), (g /= 255), (b /= 255)
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h,
    s,
    l = (max + min) / 2

  if (max == min) h = s = 0
  else {
    let d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h: h, s: s, l: l }
}

const rgbToHSL = (r, g, b) => {
  ;(r /= 255), (g /= 255), (b /= 255)

  let max = Math.max(r, g, b)
  let min = Math.min(r, g, b)

  let l = (max + min) / 2
  let s = 0
  let h = 0
  if (max != min) {
    if (l < 0.5) s = (max - min) / (max + min)
    else s = (max - min) / (2 - max - min)

    if (r == max) h = (g - b) / (max - min)
    else if (g == max) h = 2 + (b - r) / (max - min)
    else h = 4 + (r - g) / (max - min)
  }

  l = l * 100
  s = s * 100
  h = h * 60
  if (h < 0) h += 360

  return {
    h: h.toFixed(2),
    s: s.toFixed(2) + '%',
    l: l.toFixed(2) + '%',
  }
}

// rgb to NumberHSL
const rgbToNHSL = (r, g, b) => {
  ;(r /= 255), (g /= 255), (b /= 255)

  let max = Math.max(r, g, b)
  let min = Math.min(r, g, b)

  let l = (max + min) / 2
  let s = 0
  let h = 0
  if (max != min) {
    if (l < 0.5) s = (max - min) / (max + min)
    else s = (max - min) / (2 - max - min)

    if (r == max) h = (g - b) / (max - min)
    else if (g == max) h = 2 + (b - r) / (max - min)
    else h = 4 + (r - g) / (max - min)
  }

  l = l * 100
  s = s * 100
  h = h * 60

  // if hue is less than zero, wrap it around to be back in range
  if (h < 0) h += 360

  return {
    h: h,
    s: s,
    l: l,
  }
}

// function to change color's hue
const shiftHue = (rgb, deg) => {
  let hsl = rgbToNHSL(rgb.r, rgb.g, rgb.b)

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
const shiftSat = (rgb, deg) => {
  let hsl = rgbToNHSL(rgb.r, rgb.g, rgb.b)

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

// luminance calculation based on this:
// https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
// which is also where these constants are from
const calculateLuminance = (r, g, b) => {
  const srgb = [r, g, b].map(val => val / 255)
  const [R, G, B] = srgb.map(val =>
    val <= LUM_LOWER
      ? val / LUM_DIVISOR_H
      : ((val + LUM_ADDEND) / LUM_DIVISOR_L) ** LUM_EXP
  )

  const L = LUM_COEFF * R + LUM_R_ADDEND * G + LUM_G_ADDEND * B

  return L
}

// best: 7:1 ratio (getContrastRatio returns 7)
const getContrastRatio = (text, bg) => {
  let txRGB = hexToRGBA(text)
  let bgRGB = hexToRGBA(bg)

  const lum1 = calculateLuminance(txRGB.r, txRGB.g, txRGB.b)
  const lum2 = calculateLuminance(bgRGB.r, bgRGB.g, bgRGB.b)

  const light = Math.max(lum1, lum2)
  const dark = Math.min(lum1, lum2)

  const contrast = (light + 0.05) / (dark + 0.05)
  const contrastNum = Math.floor(contrast * 100) / 100

  const contrastString = `${(light + 0.05).toFixed(2)}:${(dark + 0.05).toFixed(
    2
  )}`

  return { number: contrastNum, string: contrastString }
}

// change hex color shade by amount
const changeShade = (color, amount) => {
  let usePound = false

  if (color[0] == '#') {
    color = color.slice(1)
    usePound = true
  }

  let num = parseInt(color, 16)

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

// convert number literal to hex string
const hex = num => {
  return isNaN(num)
    ? '00'
    : hexDigits[(num - (num % 16)) / 16] + hexDigits[num % 16]
}

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

let colorHexArray = Array.from(Object.values(cssColorNames))
let fancyColorHexArray = Array.from(Object.values(objectFlip(colorLib)))
let lastKnownClosestColor

// findNearestColor finds the name in the color lib that is closest to the color
// supplied as an argument
const findNearestColor = hex => {
  if (typeof hex !== 'string')
    throw new Error(
      `findNearestColor needs a hex color in string format. the parameter passed was type ${typeof hex}.`
    )
  let rgba1 = hexToRGBA(hex)
  let delta = FANCY_COLOR_NAMES == false ? 3 * 256 * 256 : 9 * 2332 * 2332
  let rgba2, result

  if (FANCY_COLOR_NAMES === false) {
    colorHexArray.forEach(colorInArray => {
      rgba2 = hexToRGBA(colorInArray)

      if (
        Math.pow(rgba2.r - rgba1.r, 2) +
          Math.pow(rgba2.g - rgba1.g, 2) +
          Math.pow(rgba2.b - rgba1.b, 2) <
        delta
      ) {
        delta =
          Math.pow(rgba2.r - rgba1.r, 2) +
          Math.pow(rgba2.g - rgba1.g, 2) +
          Math.pow(rgba2.b - rgba1.b, 2)

        lastKnownClosestColor = colorInArray
        result = colorInArray
      }
    })
  } else {
    fancyColorHexArray.forEach(colorInArray => {
      rgba2 = hexToRGBA(colorInArray)

      if (
        Math.pow(rgba2.r - rgba1.r, 2) +
          Math.pow(rgba2.g - rgba1.g, 2) +
          Math.pow(rgba2.b - rgba1.b, 2) <
        delta
      ) {
        delta =
          Math.pow(rgba2.r - rgba1.r, 2) +
          Math.pow(rgba2.g - rgba1.g, 2) +
          Math.pow(rgba2.b - rgba1.b, 2)

        lastKnownClosestColor = colorInArray
        result = colorInArray
      }
    })
  }

  let results

  let colorToFind = result !== undefined ? result : lastKnownClosestColor

  for (let key in cssColorNames)
    if (cssColorNames.hasOwnProperty(key))
      if (cssColorNames[key].indexOf(colorToFind) != -1) results = key

  return results
}

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

// this is a method for allowing the user to copy a color swatch's contents by clicking on it
const setColorSwatchListeners = () => {
  // function that just copies the text in a provided element
  const copyColor = (element, e) => {
    e.preventDefault()
    window.getSelection().selectAllChildren(element)
    document.execCommand('copy')
  }

  Array.from(backgroundShades.children).forEach(element => {
    element.addEventListener('click', e => {
      copyColor(element, e)
    })
  })

  Array.from(textShades.children).forEach(element => {
    element.addEventListener('click', e => {
      copyColor(element, e)
    })
  })
}

setColorSwatchListeners()

// this is called to update global colors every time a color is changed in any way.
// pushtohistory is used in cases where the method that updates the color doesn't also
// update the history of color randomization.
export const setComputedColors = (pushToHistory = false) => {
  setColorNames()

  let bgrgb = getComputedStyle(colorDisplay).backgroundColor.match(
    /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/
  )

  let txtrgb = getComputedStyle(colorName).color.match(
    /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/
  )

  let f = bgrgb

  let background = {
    r: f[1],
    g: f[2],
    b: f[3],
  }

  let brightness = Math.round(
    (parseInt(background.r) * 299 +
      parseInt(background.g) * 587 +
      parseInt(background.b) * 114) /
      1000
  )

  if (brightness > 125 && header.classList.contains('black') == false) {
    header.classList.add('black')
  } else if (brightness < 125 && header.classList.contains('black') == true) {
    header.classList.remove('black')
  }

  // create rgb objects and hex values for bg and text colors
  defbgRGB = { r: bgrgb[1], g: bgrgb[2], b: bgrgb[3] }
  defbgHex = rgbToHex(defbgRGB.r, defbgRGB.g, defbgRGB.b)

  deftxtRGB = { r: txtrgb[1], g: txtrgb[2], b: txtrgb[3] }
  deftxtHex = rgbToHex(deftxtRGB.r, deftxtRGB.g, deftxtRGB.b)

  // retrieve all elements to update the text in color indicators
  let bgCssName = document.getElementById('css-name')

  let rBGVal = document.getElementById('redBGValue')
  let gBGVal = document.getElementById('greenBGValue')
  let bBGVal = document.getElementById('blueBGValue')

  let rtxtVal = document.getElementById('redtxtValue')
  let gtxtVal = document.getElementById('greentxtValue')
  let btxtVal = document.getElementById('bluetxtValue')

  let hexBGVal = document.getElementById('hex-code')
  let rgbBGVal = document.getElementById('rgb-code')
  let hslBGVal = document.getElementById('hsl-code')

  let hslVals = rgbToHSL(defbgRGB.r, defbgRGB.g, defbgRGB.b)
  let hsltxtVals = rgbToHSL(deftxtRGB.r, deftxtRGB.g, deftxtRGB.b)

  let currentContrast = getContrastRatio(deftxtHex, defbgHex)
  let contrastRatioNumber = currentContrast.number
  let contrastRatioString = currentContrast.string

  let bgColorName = hexToColorName(cssColorNames, defbgHex)
  let txtColorName = hexToColorName(cssColorNames, deftxtHex)

  // if the color setting is set to "background", only update
  // the background color information indicators. otherwise,
  // only update the text color indicators.
  if (currentColorSetting == 'background') {
    hexBGVal.value = defbgHex
    rgbBGVal.innerText = `rgb(${defbgRGB.r}, ${defbgRGB.g}, ${defbgRGB.b})`
    hslBGVal.innerText = `hsl(${hslVals.h}, ${hslVals.s}, ${hslVals.l})`

    bgCssName.innerText = bgColorName
      ? `color name (actual): ${bgColorName.toLowerCase()}`
      : `color name (closest): ${findNearestColor(defbgHex).toLowerCase()}`
  } else if ((currentColorSetting = 'text')) {
    hexBGVal.value = deftxtHex
    rgbBGVal.innerText = `rgb(${deftxtRGB.r}, ${deftxtRGB.g}, ${deftxtRGB.b})`
    hslBGVal.innerText = `hsl(${hsltxtVals.h}, ${hsltxtVals.s}, ${hsltxtVals.l})`

    bgCssName.innerText = txtColorName
      ? `color name (actual): ${txtColorName.toLowerCase()}`
      : `color name (closest): ${findNearestColor(deftxtHex).toLowerCase()}`
  }

  // set the text indicators to the corresponding colors
  rBGVal.innerText = bgrgb[1]
  gBGVal.innerText = bgrgb[2]
  bBGVal.innerText = bgrgb[3]

  rtxtVal.innerText = txtrgb[1]
  gtxtVal.innerText = txtrgb[2]
  btxtVal.innerText = txtrgb[3]

  contrastRatioStringDisplay.innerText = `contrast ratio: ${contrastRatioString}`

  // find the correct wcag level for the current contrast ratio
  for (let i in wcagLevels) {
    for (let j in wcagLevels[i]) {
      let levels = wcagLevels[i][j]
      if (
        contrastRatioNumber >= levels[0] &&
        contrastRatioNumber <= levels[1]
      ) {
        contrastRatioNumberDisplay.innerText = `wcag: ${contrastRatioNumber
          .toFixed(2)
          .toString()
          .padEnd(4, '0')
          .padStart(5, '0')} (${i.toUpperCase()})`
      }
    }
  }

  let oldColorObject = colorObject

  // create a colorObject with color info in it
  colorObject = {
    bg: { rgb: defbgRGB, hex: defbgHex },
    text: { rgb: deftxtRGB, hex: deftxtHex },
  }

  // if this is the first history addition, push the colorobject to the empty history array.
  // otherwise, push the object and also increase the index, which determines position in the
  // history array for undo / redo operations.
  if (pushToHistory == true) {
    if (initialColorHistory == true) {
      initialColorHistory = false
      colorHistory.push(colorObject)
    }

    if (oldColorObject != undefined) {
      colorHistory.push(colorObject)
      colorHistoryIndex++
    }
  }

  const bgAlts = [colorObject.bg.hex]
  const textAlts = [colorObject.text.hex]

  // update the alt shades (color preview bars on the right)
  for (let i = 1; i < 6; i++) {
    let newShadeBg, newShadeText

    newShadeBg = changeShade(bgAlts[i - 1], -15)
    newShadeText = changeShade(textAlts[i - 1], -15)

    if (newShadeBg == '#000000') {
      newShadeBg = changeShade(bgAlts[0], 15)
      bgAlts.unshift(newShadeBg)
    } else bgAlts.push(newShadeBg)

    if (newShadeText == '#000000') {
      newShadeText = changeShade(textAlts[0], 15)
      textAlts.unshift(newShadeText)
    } else textAlts.push(newShadeText)
  }

  // determine the lightness of the background of the alternative shades
  // and uses that information to determine whether the text in the alternative
  // shade box should be black or white
  const manageBoxTextColor = box => {
    let f = getComputedStyle(box)['background-color'].match(
      /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/
    )

    let background = {
      r: f[1],
      g: f[2],
      b: f[3],
    }

    let brightness = Math.round(
      (parseInt(background.r) * 299 +
        parseInt(background.g) * 587 +
        parseInt(background.b) * 114) /
        1000
    )

    if (brightness > 125 && box.classList.contains('blackText') == false) {
      box.classList.add('blackText')
      header.classList.add('black')
    } else if (
      brightness < 125 &&
      box.classList.contains('blackText') == true
    ) {
      box.classList.remove('blackText')
      header.classList.remove('black')
    }
  }

  Array.from(backgroundShades.children).forEach((box, i) => {
    box.style.backgroundColor = bgAlts[i]
    box.children[0].textContent = bgAlts[i].toString()
    manageBoxTextColor(box)
  })

  Array.from(textShades.children).forEach((box, i) => {
    box.style.backgroundColor = textAlts[i]
    box.children[0].textContent = textAlts[i].toString()
    manageBoxTextColor(box)
  })
}
