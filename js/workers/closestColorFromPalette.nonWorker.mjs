import {
  cssColors,
  extendedColors,
  hks,
  ral,
  pantone,
  behr,
  traditionalJapanese,
  crayola,
  naturalColorSystem,
} from './../data/palettes/index.mjs'
import { hexToHSV, findClosestColor } from './../utils/color/index.mjs'

const LIBS = {
  css: cssColors,
  ext: extendedColors,
  hks,
  ral,
  ptn: pantone,
  bhr: behr,
  tjp: traditionalJapanese,
  crl: crayola,
  ncs: naturalColorSystem,
}

export default message => {
  const {
    data: { color },
  } = message

  if (color) {
    const hsvColor = hexToHSV(color)

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
    const closestNCSColor = findClosestColor({
      color: hsvColor,
      library: LIBS.ncs,
    })

    return {
      css: closestCSSColor,
      hks: closestHksColor,
      ral: closestRalColor,
      pantone: closestPantoneColor,
      behr: closestBehrColor,
      ['trad. jp']: closestTraditionalJapaneseColor,
      crayola: closestCrayolaColor,
      bonus: closestExtColor,
      ncs: closestNCSColor,
    }
  }
}
