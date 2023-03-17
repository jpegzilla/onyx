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
      initializer,
    })

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

  /**
   * move a palette swatch in a specified direction
   * @param  {number}  index     index of swatch to move
   * @param  {number}  direction +1 to move right, -1 to move left
   * @return {Palette}           the instance of the palette class
   */
  move(index, direction) {
    let tryToMoveTo = index + direction

    while (
      this.colorList.items[tryToMoveTo]?.locked &&
      (tryToMoveTo !== 0 || tryToMoveTo < this.colorList.items.length - 1)
    ) {
      tryToMoveTo += direction
    }

    if (tryToMoveTo === -1 || tryToMoveTo === this.colorList.items.length) {
      return
    }

    console.log({ swap: index, with: tryToMoveTo })

    const swap = this.colorList.items[index]
    const swapWith = this.colorList.items[tryToMoveTo]

    this.colorList.items[index] = swapWith
    this.colorList.items[tryToMoveTo] = swap

    this.updatePalettes()

    return this
  }

  // generate(distance) {
  //   return this
  // }

  lock(index) {
    this.colorList.items[index].locked = true

    this.updatePalettes()

    return this
  }

  unlock(index) {
    this.colorList.items[index].locked = false

    this.updatePalettes()

    return this
  }

  delete(first, count) {
    new Array(count).forEach(() => {
      if (first) this.colorList.items.shift()
      if (!first) this.colorList.items.pop()
    })

    this.updatePalettes()

    return this
  }

  duplicate() {}

  updatePalettes() {
    const currentPalettes = minerva.get(PALETTES)

    minerva.set(PALETTES, {
      ...currentPalettes,
      [this.id]: this.colorList.items,
    })
  }
}

export default Palette
