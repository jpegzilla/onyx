import {
  hexToRGBA,
  hexToHSLA,
  hexToHWB,
  hexToLAB,
  hexToXYZ,
  hexToLCH,
  hexToNRGBA,
  hslaToRGB,
  hslaToHWB,
  hslaToLAB,
  hslaToLCH,
  hslaToXYZ,
  hslaToNRGBA,
} from './../utils/color/conversions.mjs'

const fromHex = color => {
  const { r: rgbaR, g: rgbaG, b: rgbaB, a: rgbaA } = hexToRGBA(color)
  const { h: hslaH, s: hslaS, l: hslaL, a: hslaA } = hexToHSLA(color)
  const { h: hwbH, w: hwbW, b: hwbB, a: hwbA } = hexToHWB(color)
  const { l: d65L, a: d65A, b: d65B, alpha: d65Alpha } = hexToLAB(color, 'D65')
  const { l: d50L, a: d50A, b: d50B, alpha: d50Alpha } = hexToLAB(color, 'D50')
  const { l: lchL, c: lchC, h: lchH, a: lchA } = hexToLCH(color)
  const { x, y, z } = hexToXYZ(color)
  const { nR, nG, nB, nA } = hexToNRGBA(color)

  const rgba = `${rgbaR}, ${rgbaG}, ${rgbaB}, ${rgbaA}`
  const hsla = `${hslaH.toFixed(2)}, ${hslaS.toFixed(2)}, ${hslaL.toFixed(
    2
  )}, ${hslaA}`
  const hwb = `${hwbH.toFixed(2)} ${hwbW} ${hwbB} / ${hwbA}`
  const labD65 = `${d65L} ${d65A} ${d65B} / ${d65Alpha}`
  const labD50 = `${d50L} ${d50A} ${d50B} / ${d50Alpha}`
  const lch = `${lchL} ${lchC} ${lchH} / ${lchA}`
  const xyz = `${x}, ${y}, ${z}`
  const nrgba = `${nR}, ${nG}, ${nB}, ${nA}`

  return {
    rgba, // correct
    hsla, // correct
    hwb, // correct
    xyz, // correct
    ['CIELAB D50']: labD50, // CIE-L*ab D50/10 - correct
    ['CIELAB D65']: labD65, // CIE-L*ab D65/10 - correct
    ['CIELCh D65']: lch, // CIE-L*CH° D65/10 - correct
    ['norm. rgba']: nrgba, // normalized rgba (0 - 1)
  }
}

const fromHsl = color => {
  const {
    h: dh,
    s: ds,
    l: dl,
  } = {
    h: color.h / 360,
    s: color.s / 100,
    l: color.l / 100,
  }

  const {
    r: rgbaR,
    g: rgbaG,
    b: rgbaB,
    a: rgbaA,
  } = hslaToRGB(dh, ds, dl, color.a)
  const { h: hslaH, s: hslaS, l: hslaL, a: hslaA } = color
  const { h: hwbH, w: hwbW, b: hwbB, a: hwbA } = hslaToHWB(color)
  const { l: d65L, a: d65A, b: d65B, alpha: d65Alpha } = hslaToLAB(color, 'D65')
  const { l: d50L, a: d50A, b: d50B, alpha: d50Alpha } = hslaToLAB(color, 'D50')
  const { l: lchL, c: lchC, h: lchH, a: lchA } = hslaToLCH(color)
  const { x, y, z } = hslaToXYZ(color)
  const { nR, nG, nB, nA } = hslaToNRGBA(color)

  const rgba = `${rgbaR}, ${rgbaG}, ${rgbaB}, ${rgbaA}`
  const hsla = `${hslaH.toFixed(2)}, ${hslaS.toFixed(2)}, ${hslaL.toFixed(
    2
  )}, ${hslaA}`
  const hwb = `${hwbH.toFixed(2)} ${hwbW} ${hwbB} / ${hwbA}`
  const labD65 = `${d65L} ${d65A} ${d65B} / ${d65Alpha}`
  const labD50 = `${d50L} ${d50A} ${d50B} / ${d50Alpha}`
  const lch = `${lchL} ${lchC} ${lchH} / ${lchA}`
  const xyz = `${x}, ${y}, ${z}`
  const nrgba = `${nR}, ${nG}, ${nB}, ${nA}`

  return {
    rgba, // correct
    hsla, // correct
    hwb, // correct
    xyz, // correct
    ['CIELAB D50']: labD50, // CIE-L*ab D50/10 - correct
    ['CIELAB D65']: labD65, // CIE-L*ab D65/10- correct
    ['CIELCh D65']: lch, // CIE-L*CH° D65/10- correct
    ['norm. rgba']: nrgba, // normalized rgba (0 - 1)
  }
}

self.onmessage = message => {
  const {
    data: { color, format },
  } = message

  let output = {}

  if (color) {
    switch (format) {
      case 'hsl':
        output = fromHsl(color)
        break
      case 'hex':
        output = fromHex(color)
        break
      case 'rgb':
        break
    }

    self.postMessage(output)
  }
}
