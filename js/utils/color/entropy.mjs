import { getRandomInt } from './../misc.mjs'

/**
 * get a random color in the given format
 * @return {object} random color
 */
export const getRandomColor = format => {
  switch (format) {
    case 'hsl':
      return {
        h: getRandomInt(0, 360, true),
        s: getRandomInt(0, 100, true),
        l: getRandomInt(0, 100, true),
        a: 1,
      }
    default:
      return {
        format,
      }
  }
}
