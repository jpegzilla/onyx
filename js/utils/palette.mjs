// ♪音楽 → 暁RECORDS - BLACK MIRROR ON THE WALL : https://www.youtube.com/watch?v=QyBjXlCMe7Y
import { uuidv4 } from './misc.mjs'

/**
 * used to create palette objects.
 */
class Palette {
  static defaultSettings = {}

  constructor(minerva) {
    this.colors = []
    this.paletteId = uuidv4()

    this.#updatePalettes(minerva)

    return this.paletteId
  }

  addColor(colorPosition = 0, color) {
    this.colors.insertAt(colorPosition, color)
  }

  removeColor(colorPosition, amount = 1) {
    this.colors.splice(colorPosition, amount)
  }

  delete() {}

  duplicate() {}

  #updatePalettes(minerva) {
    const currentPalettes = minerva.get('palettes')
    minerva.set('palettes', [...currentPalettes, this.colors])
  }
}

export default Palette
