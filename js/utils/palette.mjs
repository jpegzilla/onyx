// ♪音楽 → 暁RECORDS - BLACK MIRROR ON THE WALL : https://www.youtube.com/watch?v=QyBjXlCMe7Y
import { uuidv4 } from './misc.mjs'
import LimitedList from './dataStructures/limitedList.mjs'
import { minerva } from './../main.mjs'

const PALETTES = 'palettes'

/**
 * used to create palette objects.
 * @param {object} initializer the initial palette in the list
 * @param {string} initialId   the id of the first palette in the list
 */
class Palette {
  static defaultSettings = {}

  constructor({ initializer, initialId }) {
    this.colorList = new LimitedList({
      limit: 5,
    })

    if (initializer) initializer.forEach(e => this.colorList.add(e))

    this.id = initialId || uuidv4()

    this.updatePalettes()
  }

  createColorObject(color) {
    return {
      color,
      locked: false,
    }
  }

  addColorAtIndex(index, color) {
    this.colorList.setAt(index, color)

    this.updatePalettes()

    return this
  }

  addColor(color) {
    this.colorList.add(this.createColorObject(color))

    this.updatePalettes()

    return this
  }

  removeColorAtIndex(index) {
    this.colorList.removeAt(index)

    this.updatePalettes()

    return this
  }

  // generate(distance) {
  //   return this
  // }

  lock(index) {
    this.colorList[index].locked = true

    return this
  }

  delete() {}

  duplicate() {}

  updatePalettes() {
    const currentPalettes = minerva.get(PALETTES)

    // console.log('object going in', this)
    minerva.set(PALETTES, {
      ...currentPalettes,
      [this.id]: this.colorList.items,
    })
  }
}

export default Palette
