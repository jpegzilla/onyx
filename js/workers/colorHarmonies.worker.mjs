import { getComplementaryColor } from './../utils/color/harmonies.mjs'

self.onmessage = message => {
  const { data: color } = message

  if (color) {
    const complementary = getComplementaryColor(color)

    self.postMessage({
      complementary,
    })
  }
}
