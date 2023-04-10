import { getRandomInt } from './../misc.mjs'
import { calculateAPCAContrast } from './calculations.mjs'
import { hslaToRGB } from './conversions.mjs'

/**
 * get a random color in the given format
 * @param  {string} format what format to generate
 * @return {object}        random color in given format
 */
export const getRandomColor = (
  format,
  ranges = [
    [0, 360],
    [0, 100],
    [0, 100],
  ]
) => {
  switch (format) {
    case 'hsl':
      return {
        h: getRandomInt(ranges[0][0], ranges[0][1], true),
        s: getRandomInt(ranges[1][0], ranges[1][1], true),
        l: getRandomInt(ranges[2][0], ranges[2][1], true),
        a: 1,
      }
    default:
      return {
        format,
      }
  }
}

/**
 * get a pair of colors in a
 * @param  {string} format what format to generate
 * @return {object}        random color pair in given format
 */
export const getRandomColorPair = (
  format,
  ranges = [
    [0, 360],
    [0, 100],
    [0, 100],
  ]
) => {
  const { abs } = Math

  const APCAThreshold = 20
  const lightThreshold = 30

  switch (format) {
    case 'hsl':
      const color1 = {
        h: getRandomInt(ranges[0][0], ranges[0][1], true),
        s: getRandomInt(ranges[1][0], ranges[1][1], true),
        l: getRandomInt(ranges[2][0], ranges[2][1], true),
        a: 1,
      }

      const colorLightRange =
        color1.l + lightThreshold > 100
          ? color1.l - lightThreshold
          : color1.l + lightThreshold

      const rgb1 = hslaToRGB(color1.h / 360, color1.s / 100, color1.l / 100)

      let color2 = {
        h: getRandomInt(ranges[0][0], ranges[0][1], true),
        s: getRandomInt(ranges[1][0], ranges[1][1], true),
        l: getRandomInt(colorLightRange, ranges[2][1], true),
        a: 1,
      }

      try {
        const getRandomColor2 = lightRange => {
          const tempColors = getRandomColor(format)

          const rgb2 = hslaToRGB(
            tempColors.h / 360,
            tempColors.s / 100,
            tempColors.l / 100
          )

          if (abs(calculateAPCAContrast(rgb1, rgb2)) >= APCAThreshold) {
            color2 = tempColors

            return
          }

          getRandomColor2(lightRange + 10)
        }

        getRandomColor2(colorLightRange)

        return {
          fg: color1,
          bg: color2,
        }
      } catch {
        console.warn('no color found within acceptable range.')

        return {
          fg: color1,
          bg: color2,
        }
      }

    default:
      return {
        format,
      }
  }
}
