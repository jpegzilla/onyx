import extendedColors from './extendedColors.mjs'
import cssColors from './cssColors.mjs'

export const getColors = (extended = false) => {
  if (extended) return extendedColors
  return cssColors
}
