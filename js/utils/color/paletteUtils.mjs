import { hslToHex, hslaToRGB, hslToHSV, stringifyHSL } from './conversions.mjs'
import { drawOnyxPalette } from './palettePainter.mjs'
import { zeroPaddedHex } from './../misc.mjs'
import { floatToHex } from './../math.mjs'

const getRGBColors = palette =>
  palette.map(({ color: { h, s, l } }) => hslaToRGB(h / 360, s / 100, l / 100))
const getHexColors = palette => palette.map(({ color }) => hslToHex(color))

export const generatePaletteTitle = () => {}

export const generateHexPalette = palette => {
  const hexColors = getHexColors(palette)

  return hexColors
    .map(e => e.replace('#', ''))
    .map(
      f =>
        `${f
          .split('')
          .map(e => e.charCodeAt(0).toString(16).padStart(2, 0))
          .join(' ')} 0D 0A`
    )
    .join(' ')
}

export const generatePalPalette = palette => {
  const rgbColors = getRGBColors(palette)

  return `JASC-PAL
0100
${palette.length}
${rgbColors.map(({ r, g, b }) => `${r} ${g} ${b}`).join('\n')}`
}

export const generateGimpPalette = palette => {
  const rgbColors = getRGBColors(palette)
  const hexColors = getHexColors(palette)

  return `GIMP Palette
#generated with jpegzilla.com/onyx
${rgbColors
  .map(
    ({ r, g, b }, i) =>
      `${r.toString().padEnd(3)}\t${g.toString().padEnd(3)}\t${b
        .toString()
        .padEnd(3)}\t${hexColors[i].replace('#', '')}`
  )
  .join('\n')}`
}

export const generateSassPalette = palette => {
  const stringifiedHSL = palette.map(({ color: { h, s, l } }) =>
    stringifyHSL({
      h: h.toFixed(2),
      s: s.toFixed(2),
      l: l.toFixed(2),
    })
  )

  return `${stringifiedHSL.map((e, i) => `$color-${i + 1}: ${e}`).join('\n')}`
}

export const generateCSSPalette = palette => {
  const stringifiedHSL = palette.map(({ color: { h, s, l } }) =>
    stringifyHSL({
      h: h.toFixed(2),
      s: s.toFixed(2),
      l: l.toFixed(2),
    })
  )

  return `${stringifiedHSL.map((e, i) => `--color-${i + 1}: ${e}`).join('\n')}`
}

export const generatePaintPalette = palette => {
  const hexColors = getHexColors(palette)

  return `;paint.net Palette File
;generated with jpegzilla.com/onyx
${hexColors.map(e => `FF${e.replace('#', '')}`).join('\n')}
`
}

/**
 * generate hexadecimal code for an ase palette.
 * @param  {array} palette  array of hsl colors.
 * @return {string}         hex representation of ase file.
 */
export const generateASEPalette = palette => {
  const rgbColors = getRGBColors(palette)
  const hexColors = getHexColors(palette)

  const fileHeader = `41 53 45 46 00 01 00 00 00 00 00 ${zeroPaddedHex(
    rgbColors.length
  )}`

  const generateColorBlock = (color, index) => {
    const GROUP_START = '00 01'
    const BLOCK_LENGTH = '00 00 00 22'
    const COLOR_NAME_LENGTH = `00 ${zeroPaddedHex(color.length)}`
    const COLOR_NAME = color
      .replace('#', '')
      .split('')
      .map(f => `00 ${f.charCodeAt(0).toString(16).padStart(2, 0)}`)
      .join(' ')
    const NULL_TERM = '00 00'
    const COLOR_SPACE = '52 47 42 20'
    const RED = floatToHex(rgbColors[index].r / 255)
    const GREEN = floatToHex(rgbColors[index].g / 255)
    const BLUE = floatToHex(rgbColors[index].b / 255)
    const MODE = '00 00'

    return `${GROUP_START} ${BLOCK_LENGTH} ${COLOR_NAME_LENGTH} ${COLOR_NAME} ${NULL_TERM} ${COLOR_SPACE} ${RED} ${GREEN} ${BLUE} ${MODE}`
  }

  const colorBlocks = hexColors.map(generateColorBlock)

  return `${fileHeader} ${colorBlocks.join(' ')}`
}

export const generateImagePalette = async (palette, canvas) => {
  const image = await drawOnyxPalette(palette, canvas)

  return image
}

export const generateCroppedImagePalette = async (palette, canvas) => {
  const image = await drawOnyxPalette(palette, canvas, true)

  return image
}
