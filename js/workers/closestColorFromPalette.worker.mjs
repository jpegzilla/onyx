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
}

self.onmessage = message => {
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
    const closestDentouShoku = findClosestColor({
      color: hsvColor,
      library: LIBS.tjp,
    })
    const closestCrayolaColor = findClosestColor({
      color: hsvColor,
      library: LIBS.crl,
    })

    self.postMessage({
      css: closestCSSColor,
      hks: closestHksColor,
      ral: closestRalColor,
      pantone: closestPantoneColor,
      behr: closestBehrColor,
      ['trad. jp']: closestDentouShoku,
      crayola: closestCrayolaColor,
      bonus: closestExtColor,
    })
  }
}
