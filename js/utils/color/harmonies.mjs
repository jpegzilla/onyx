import { HEX_WHITE } from './constants.mjs'

export const getComplementaryColor = hex => {
  const inputHex = parseInt(hex.replace(/^#/, ''), 16)

  const outputHex = (HEX_WHITE - inputHex).toString(16).padStart(6, 0)

  return `#${outputHex}`
}
