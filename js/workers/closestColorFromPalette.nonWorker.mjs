import {
  cssColors,
  extendedColors,
  hks,
  ral,
  pantone,
  behr,
  traditionalJapanese,
  crayola,
} from './../data/palettes/index.mjs'
import { TAU } from './../utils/color/constants.mjs'
import { hexToHSV } from './../utils/color/conversions.mjs'

const LIBS = {
  css: cssColors,
  ext: extendedColors,
  hks,
  ral,
  ptn: pantone,
  bhr: behr,
  tjp: traditionalJapanese,
  crl: crayola,
}

/**
 * given an hsl color in {h, s, v} format and an array of objects
 * containing several colors in hex format, finds the closest
 * match for the hsl color in the array.
 * @arg {Object} args - findClosestColor parameter
 * @arg {Object} args.color - color in hsv format
 * @arg {Array} args.library - list of colors to search
 * @return {Object} closest match to given color from library
 */
const findClosestColor = ({ color, library }) => {
  const { sin, cos, pow } = Math

  const { h, s, v } = color

  let lowestDistance = Infinity
  let closestColor

  for (const libColor of library) {
    const { hex } = libColor
    const { h: libH, s: libS, v: libV } = hexToHSV(hex)

    const [h1, s1, v1] = [h * TAU, s, v]
    const [h2, s2, v2] = [libH * TAU, libS, libV]

    const distance =
      pow(sin(h1) * s1 * v1 - sin(h2) * s2 * v2, 2) +
      pow(cos(h1) * s1 * v1 - cos(h2) * s2 * v2, 2) +
      pow(v1 - v2, 2)

    if (distance < lowestDistance) {
      lowestDistance = distance
      closestColor = libColor
    }
  }

  return closestColor
}

export default message => {
  const { data: hexColor } = message

  if (hexColor) {
    const hsvColor = hexToHSV(hexColor)

    const closestCSSColor = findClosestColor({
      color: hsvColor,
      library: LIBS.css,
    })
    const closestExtColor = findClosestColor({
      color: hsvColor,
      library: LIBS.ext,
    })
    const closestHksColor = findClosestColor({
      color: hsvColor,
      library: LIBS.hks,
    })
    const closestRalColor = findClosestColor({
      color: hsvColor,
      library: LIBS.ral,
    })
    const closestPantoneColor = findClosestColor({
      color: hsvColor,
      library: LIBS.ptn,
    })
    const closestBehrColor = findClosestColor({
      color: hsvColor,
      library: LIBS.bhr,
    })
    const closestTraditionalJapaneseColor = findClosestColor({
      color: hsvColor,
      library: LIBS.tjp,
    })
    const closestCrayolaColor = findClosestColor({
      color: hsvColor,
      library: LIBS.crl,
    })

    return {
      css: closestCSSColor,
      hks: closestHksColor,
      ral: closestRalColor,
      pantone: closestPantoneColor,
      behr: closestBehrColor,
      ['伝統色']: closestTraditionalJapaneseColor,
      crayola: closestCrayolaColor,
      ['bonus']: closestExtColor,
    }
  }
}
