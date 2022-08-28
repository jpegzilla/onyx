import {
  hexToRGBA,
  hexToHSLA,
  hexToHWB,
  hexToLAB,
  hexToXYZ,
  hexToLCH,
  hexToNRGBA,
} from './../utils/color/conversions.mjs'

self.onmessage = message => {
  const { data: color } = message

  if (color) {
    const { r: rgbaR, g: rgbaG, b: rgbaB, a: rgbaA } = hexToRGBA(color)
    const { h: hslaH, s: hslaS, l: hslaL, a: hslaA } = hexToHSLA(color)
    const { h: hwbH, w: hwbW, b: hwbB, a: hwbA } = hexToHWB(color)
    const {
      l: d65L,
      a: d65A,
      b: d65B,
      alpha: d65Alpha,
    } = hexToLAB(color, 'D65')
    const {
      l: d50L,
      a: d50A,
      b: d50B,
      alpha: d50Alpha,
    } = hexToLAB(color, 'D50')
    const { l: lchL, c: lchC, h: lchH, a: lchA } = hexToLCH(color)
    const { x, y, z } = hexToXYZ(color)
    const { nR, nG, nB, nA } = hexToNRGBA(color)

    const rgba = `rgba(${rgbaR}, ${rgbaG}, ${rgbaB}, ${rgbaA})`
    const hsla = `hsla(${hslaH}, ${hslaS}, ${hslaL}, ${hslaA})`
    const hwb = `hwb(${hwbH} ${hwbW} ${hwbB} / ${hwbA})`
    const labD65 = `lab(${d65L} ${d65A} ${d65B} / ${d65Alpha})`
    const labD50 = `lab(${d50L} ${d50A} ${d50B} / ${d50Alpha})`
    const lch = `lch(${lchL} ${lchC} ${lchH} / ${lchA})`
    const xyz = `xyz(${x}, ${y}, ${z})`
    const nrgba = `[${nR}, ${nG}, ${nB}, ${nA}]`

    self.postMessage({
      rgba, // correct
      hsla, // correct
      hwb, // correct
      xyz, // correct
      ['CIELAB D50']: labD50, // CIE-L*ab D50/10 - correct
      ['CIELAB D65']: labD65, // CIE-L*ab D65/10- correct
      ['CIELCh D65']: lch, // CIE-L*CH° D65/10- correct
      ['normalized rgba']: nrgba, // normalized rgba (0 - 1)
    })
  }
}
