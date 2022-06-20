import {
  cssColors,
  extendedColors,
  hks,
  ral,
  pantone,
  behr
} from './../data/palettes/index.mjs'
import { TAU } from './../utils/color/constants.mjs'
import { hexToHSV } from './../utils/color/conversions.mjs'

const LIBS = {
  css: cssColors,
  ext: extendedColors,
  hks,
  ral,
  ptn: pantone,
  bhr: behr
}

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

self.onmessage = message => {
  const { data: hexColor } = message

  if (hexColor) {
    const closestCSSColor = findClosestColor({
      color: hexToHSV(hexColor),
      library: LIBS.css,
    })
    const closestExtColor = findClosestColor({
      color: hexToHSV(hexColor),
      library: LIBS.ext,
    })
    const closestHksColor = findClosestColor({
      color: hexToHSV(hexColor),
      library: LIBS.hks,
    })
    const closestRalColor = findClosestColor({
      color: hexToHSV(hexColor),
      library: LIBS.ral,
    })
    const closestPantoneColor = findClosestColor({
      color: hexToHSV(hexColor),
      library: LIBS.ptn,
    })
    const closestBehrColor = findClosestColor({
      color: hexToHSV(hexColor),
      library: LIBS.bhr,
    })

    self.postMessage({
      css: closestCSSColor,
      ext: closestExtColor,
      hks: closestHksColor,
      ral: closestRalColor,
      pantone: closestPantoneColor,
      behr: closestBehrColor
    })
  }
}
