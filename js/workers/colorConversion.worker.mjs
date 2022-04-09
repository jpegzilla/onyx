import {
  hexToRGBA,
  hexToHSLA,
  hexToHWB,
  hexToLAB,
  hexToXYZ,
  hexToLCH,
} from './../utils/color/conversions.mjs'

self.onmessage = message => {
  const { data: color } = message

  if (color) {
    const rgba = `rgba(${hexToRGBA(color).r}, ${hexToRGBA(color).g}, ${
      hexToRGBA(color).b
    }, ${hexToRGBA(color).a})`

    const hsla = `hsla(${hexToHSLA(color).h}, ${hexToHSLA(color).s}, ${
      hexToHSLA(color).l
    }, ${hexToHSLA(color).a})`

    const hwb = `hwb(${hexToHWB(color).h} ${hexToHWB(color).w} ${
      hexToHWB(color).b
    } / ${hexToHWB(color).a})`

    const lab = `lab(${hexToLAB(color).l} ${hexToLAB(color).a} ${
      hexToLAB(color).b
    } / ${hexToLAB(color).alpha})`

    const lch = `lch(${hexToLCH(color).l} ${hexToLCH(color).c} ${
      hexToLCH(color).h
    } / ${hexToLCH(color).a})`

    const xyz = `xyz(${hexToXYZ(color).x}, ${hexToXYZ(color).y}, ${
      hexToXYZ(color).z
    })`

    self.postMessage({
      rgba,
      hsla,
      hwb,
      lab,
      lch,
      xyz,
    })
  }
}
