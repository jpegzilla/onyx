import { getComplementaryColor } from './../utils/color/harmonies.mjs'

export default message => {
  const { data: color } = message

  if (color) {
    const complementary = getComplementaryColor(color)

    return {
      complementary,
    }
  }
}
