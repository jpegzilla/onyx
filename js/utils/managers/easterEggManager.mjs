import { hexToRGBA, hslaToRGB } from './../../utils/color/index.mjs'

const easterEggPairs = {
  'blondie - pollinator': ['fff1d4', 'e32028'],
  'blackpink in your area': ['efa7b5', '000000'], // hsl(348, 69%, 80%)
  'this is halloween': ['ff9a00', '000000'],
  'new hospital floor': ['e30000', 'ffffff'],
  'patchouli knowledge': ['541c60', 'f9acc0'], // hsl(289, 55%, 24%), hsl(344, 87%, 83%)
  'delicious coffee...': ['48332b', 'f4efe8'], // hsl(17.5, 25.7%, 22.5%), hsl(31.7, 34.7%, 93.4%)
}

const easterEggColors = {
  'I love you, natalya!': '2c75ff', // hsl(219, 100%, 59%)
}

const colorIsClose = color => {
  const RED_THRESHOLD = 20
  const GREEN_THRESHOLD = 20
  const BLUE_THRESHOLD = 20

  return (
    color[0] <= RED_THRESHOLD &&
    color[1] <= GREEN_THRESHOLD &&
    color[2] <= BLUE_THRESHOLD
  )
}

const checkForSingleEgg = ({ fg, bg }) => {
  const { abs } = Math
  const results = []

  for (const [name, color] of easterEggColors.entries) {
    const [c1r, c1g, c1b] = hexToRGBA(color).values
    const [fgr, fgg, fgb] = hslaToRGB(
      fg.h / 360,
      fg.s / 100,
      fg.l / 100,
      fg.a
    ).values
    const [bgr, bgg, bgb] = hslaToRGB(
      bg.h / 360,
      bg.s / 100,
      bg.l / 100,
      bg.a
    ).values

    const foregroundDistance = [fgr - c1r, fgg - c1g, fgb - c1b].map(abs)
    const backgroundDistance = [bgr - c1r, bgg - c1g, bgb - c1b].map(abs)

    if (colorIsClose(foregroundDistance) || colorIsClose(backgroundDistance)) {
      results.push({
        name,
        distance: colorIsClose(foregroundDistance)
          ? foregroundDistance.sum()
          : backgroundDistance.sum(),
      })
    } else results.push(false)
  }

  return results.filter(Boolean).sort((a, b) => a.distance - b.distance)[0]
}

const checkForPairEgg = ({ fg, bg }) => {
  const { abs } = Math
  const results = []

  for (const [name, [color1, color2]] of easterEggPairs.entries) {
    const [c1r, c1g, c1b] = hexToRGBA(color1).values
    const [c2r, c2g, c2b] = hexToRGBA(color2).values

    const [fgr, fgg, fgb] = hslaToRGB(
      fg.h / 360,
      fg.s / 100,
      fg.l / 100,
      fg.a
    ).values
    const [bgr, bgg, bgb] = hslaToRGB(
      bg.h / 360,
      bg.s / 100,
      bg.l / 100,
      bg.a
    ).values

    const fgDistance1 = [fgr - c1r, fgg - c1g, fgb - c1b].map(abs)
    const fgDistance2 = [fgr - c2r, fgg - c2g, fgb - c2b].map(abs)

    const bgDistance1 = [bgr - c1r, bgg - c1g, bgb - c1b].map(abs)
    const bgDistance2 = [bgr - c2r, bgg - c2g, bgb - c2b].map(abs)

    let foregroundDistance = Infinity,
      backgroundDistance = Infinity

    if (colorIsClose(fgDistance1)) foregroundDistance = fgDistance1.sum()
    if (colorIsClose(fgDistance2)) foregroundDistance = fgDistance2.sum()
    if (colorIsClose(bgDistance1)) backgroundDistance = bgDistance1.sum()
    if (colorIsClose(bgDistance2)) backgroundDistance = bgDistance2.sum()

    if (
      (colorIsClose(fgDistance1) && colorIsClose(bgDistance2)) ||
      (colorIsClose(fgDistance2) &&
        colorIsClose(bgDistance1) &&
        foregroundDistance < Infinity &&
        backgroundDistance < Infinity)
    ) {
      results.push({
        name,
        distance: foregroundDistance + backgroundDistance,
      })
    } else results.push(false)
  }

  return results.filter(Boolean).sort((a, b) => a.distance - b.distance)[0]
}

export const checkForEgg = ({ fg, bg }) => {
  const matchingPair = checkForPairEgg({
    fg,
    bg,
  })

  const matchingSingle = checkForSingleEgg({
    fg,
    bg,
  })

  return matchingPair ? matchingPair : matchingSingle
}
