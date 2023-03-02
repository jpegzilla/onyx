import { hexToHSLA, hslaToRGB, rgbaToHex } from './conversions.mjs'

export const getComplementaryColors = hex => {
  const { h, s, l } = hexToHSLA(hex)
  const rotatedH = h + 180 < 360 ? h + 180 : h + 180 - 360

  const rgb = hslaToRGB(rotatedH / 360, parseInt(s) / 100, parseInt(l) / 100)

  const outputHex = rgbaToHex(rgb)

  return [hex, `#${outputHex}`]
}

// 145 degrees and 225 degrees (80 degree difference)
export const getSplitComplementaryColors = hex => {
  const { h, s, l } = hexToHSLA(hex)
  const rotatedH1 = h + 145 < 360 ? h + 145 : h + 145 - 360
  const rotatedH2 = h + 225 < 360 ? h + 225 : h + 225 - 360

  const rgb1 = hslaToRGB(rotatedH1 / 360, parseInt(s) / 100, parseInt(l) / 100)
  const rgb2 = hslaToRGB(rotatedH2 / 360, parseInt(s) / 100, parseInt(l) / 100)

  const outputHex1 = rgbaToHex(rgb1)
  const outputHex2 = rgbaToHex(rgb2)

  return [`#${outputHex1}`, hex, `#${outputHex2}`]
}

// 30 degree separation
export const getAnalogousColors = hex => {
  const { h, s, l } = hexToHSLA(hex)
  const rotatedH1 = h + 30 < 360 ? h + 30 : h + 30 - 360
  const rotatedH2 = h - 30 < 360 ? h - 30 : h - 30 - 360

  const rgb1 = hslaToRGB(rotatedH1 / 360, parseInt(s) / 100, parseInt(l) / 100)
  const rgb2 = hslaToRGB(rotatedH2 / 360, parseInt(s) / 100, parseInt(l) / 100)

  const outputHex1 = rgbaToHex(rgb1)
  const outputHex2 = rgbaToHex(rgb2)

  return [`#${outputHex1}`, hex, `#${outputHex2}`]
}

export const getTriadicHarmony = hex => {}

export const getTetradicHarmony = hex => {}

export const getSquareHarmony = hex => {}
