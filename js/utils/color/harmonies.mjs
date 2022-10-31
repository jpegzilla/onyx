import { hexToHSLA, hslaToRGB, rgbaToHex } from './conversions.mjs'

export const getComplementaryColor = hex => {
  const { h, s, l } = hexToHSLA('#1ecbe1')
  const rotatedH = h + 180 < 360 ? h + 180 : h + 180 - 360

  const rgb = hslaToRGB(rotatedH / 360, parseInt(s) / 100, parseInt(l) / 100)

  const outputHex = rgbaToHex(rgb)

  return `#${outputHex}`
}
