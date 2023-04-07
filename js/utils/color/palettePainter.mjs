import { findClosestColor } from './calculations.mjs'
import { pantone } from './../../data/palettes/index.mjs'
import { hslToHSV, hslToHex } from './conversions.mjs'

const montserrat = new FontFace(
  'montserrat',
  'url(./../../../assets/fonts/Montserrat-VariableFont_wght.ttf)'
)
const redhatmonoregular = new FontFace(
  'red hat mono regular',
  'url(./../../../assets/fonts/RedHatMono-Regular.ttf)'
)

montserrat.load().then(font => {
  document.fonts.add(font)
})
redhatmonoregular.load().then(font => {
  document.fonts.add(font)
})

const fixDPI = canvas => {
  const DPI = window.devicePixelRatio
  let height = +getComputedStyle(canvas).getPropertyValue('height').slice(0, -2)
  let width = +getComputedStyle(canvas).getPropertyValue('width').slice(0, -2)

  canvas.setAttribute('height', height * DPI)
  canvas.setAttribute('width', width * DPI)

  return canvas
}

const loadImage = img =>
  new Promise(resolve => {
    img.onload = () => resolve()
  })

/**
 * draws an onyx palette on a given canvas.
 * @param  {array}             palette array of colors
 * @param  {HTMLCanvasElement} canvas element to paint canvas on
 */
export const drawOnyxPalette = async (palette, canvas, crop = false) => {
  const { height, width } = fixDPI(canvas)
  const ctx = canvas.getContext('2d', {
    alpha: false,
  })

  ctx.textRendering = 'geometricPrecision'

  const totalSwatchCount = palette.length
  const mappedPalettes = palette.map(({ color }) => color)
  const GAP = crop ? 0 : 80

  const swatchHeight = crop ? height : height - GAP * 2
  const swatchWidth = width / totalSwatchCount
  const textColor = '#fcfdff'
  const backgroundColor = '#060408'

  let swatchPositionX = 0
  let swatchPositionY = 0

  // fill with background color
  ctx.fillStyle = backgroundColor
  ctx.fillRect(swatchPositionX, swatchPositionY, width, height)

  // draw icon
  const icon = new Image()
  icon.src = './assets/img/icons/svg/rainbow-flower.svg'

  let GAP_HOR_CENTER_BOTTOM = 0

  if (!crop) {
    const ICON_SIZE = 50
    const PAD_LEFT = 20
    const PAD_RIGHT = 30
    const GAP_HOR_CENTER_TOP = GAP / 2 - ICON_SIZE / 2
    GAP_HOR_CENTER_BOTTOM = height - GAP / 2 - ICON_SIZE / 2

    await loadImage(icon)
    ctx.drawImage(icon, PAD_LEFT, GAP_HOR_CENTER_TOP, ICON_SIZE, ICON_SIZE)

    ctx.font = `bold 24px "montserrat", monospace`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'right'
    ctx.fillStyle = textColor
    ctx.fillText('created with jpegzilla.com/onyx', width - PAD_RIGHT, GAP / 2)
  }

  for (let i = 0; i < mappedPalettes.length; i++) {
    const color = mappedPalettes[i]
    const { h, s, l } = color
    const { name } = findClosestColor({
      color: hslToHSV({ h: h / 360, s: s / 100, l: l / 100 }),
      library: pantone,
    })

    const hex = hslToHex(color)

    const SWATCH_WIDTH = swatchWidth + totalSwatchCount

    ctx.fillStyle = hex
    ctx.fillRect(
      swatchPositionX,
      GAP,
      // for some reason I couldn't get the last swatch up against the
      // edge of the canvas. this is probably a rounding issue.
      // actually, there are probably a bunch of rounding issues due to me
      // rushing the canvas rendering code.
      SWATCH_WIDTH,
      // i === mappedPalettes.length - 1 ? SWATCH_WIDTH + 4 : SWATCH_WIDTH,
      swatchHeight
    )

    if (!crop) {
      const LINE_HEIGHT = 1.42
      const FONT_SIZE = 18
      const generateYPosition = lineNumber =>
        FONT_SIZE * (LINE_HEIGHT * lineNumber)

      ctx.font = `bold ${FONT_SIZE}px "red hat mono regular", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = textColor
      ctx.fillText(
        name,
        Math.floor(swatchPositionX + SWATCH_WIDTH / 2) - 4,
        GAP_HOR_CENTER_BOTTOM + 13 + generateYPosition(0)
      )
      ctx.fillText(
        hex.toUpperCase(),
        Math.floor(swatchPositionX + SWATCH_WIDTH / 2) - 4,
        GAP_HOR_CENTER_BOTTOM + 13 + generateYPosition(1)
      )
    }

    swatchPositionX += ~~swatchWidth
  }

  return canvas
}
