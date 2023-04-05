// ♪音楽 → 暁RECORDS - BLACK MIRROR ON THE WALL : https://www.youtube.com/watch?v=QyBjXlCMe7Y
import { uuidv4, getRandomInt } from './../misc.mjs'
import LimitedList from './limitedList.mjs'
import { minerva } from './../../main.mjs'
import { PALETTES, ACTIVE_PALETTE } from './../state/minervaActions.mjs'
// import { hslaToLCH, lchToHsl } from './../color/conversions.mjs'
import { shiftHslHue } from './../color/modifications.mjs'

class Palette {
  /**
   * used to create palette objects.
   * @param {object} args
   * @param {array}  args.initializer the initial palette in the list
   * @param {string} args.initialId   the id of the first palette in the list
   */
  constructor({ initializer = [], initialId = uuidv4() } = {}) {
    this.colorList = new LimitedList({
      limit: 5,
      initializer,
    })

    this.id = initialId || uuidv4()

    this.updatePalettes()
  }

  createColorObject(color, name = 'onyx-palette') {
    return {
      color,
      locked: false,
      name,
    }
  }

  addColorAtIndex(index, color) {
    this.colorList.setAt(index, color)

    this.updatePalettes()

    return this
  }

  addColor(color, name) {
    this.colorList.add(this.createColorObject(color, name))

    this.updatePalettes()

    return this
  }

  removeColorAtIndex(index) {
    this.colorList.removeAt(index)

    if (this.colorList.items.length === 0) {
      // prevent an empty palette from being saved
      return this
    }

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

    if (this.colorList.items[index].locked) return

    while (
      this.colorList.items[tryToMoveTo]?.locked &&
      (tryToMoveTo !== 0 || tryToMoveTo < this.colorList.items.length - 1)
    ) {
      tryToMoveTo += direction
    }

    if (tryToMoveTo === -1 || tryToMoveTo === this.colorList.items.length) {
      return
    }

    const swap = this.colorList.items[index]
    const swapWith = this.colorList.items[tryToMoveTo]

    this.colorList.items[index] = swapWith
    this.colorList.items[tryToMoveTo] = swap

    this.updatePalettes()

    return this
  }

  static generateMonochromatic(initial, count = 5, factor = 30) {
    const { h, s, l } = initial

    const colorsToGenerate = count - 1
    const lightThreshold = 98
    const darkThreshold = 10

    // if color is close to black or white, modulate lightness
    if (l <= darkThreshold || l >= lightThreshold) {
      const lightModulation = Array(count)
        .fill()
        .map((_, i) =>
          i === 0
            ? { h, s, l }
            : { h, s, l: l <= darkThreshold ? l + factor * i : l - factor * i }
        )

      return lightModulation
    }

    // if color saturation is too low, modulate saturation and lightness
    if (s < 10) {
      const lightModulation = Array(count)
        .fill()
        .map((_, i) =>
          i === 0
            ? { h, s, l }
            : {
                h,
                s: s + factor * i,
                l,
              }
        )

      return lightModulation
    }

    // otherwise, modulate hue
    // I want to use cielch for this, but it so often produces colors
    // that are out of gamut and can't be displayed on the average
    // monitor! I don't know how to fix this.
    const hueModulation = [{ h, s, l }]

    for (var i = 0; i < colorsToGenerate; i++) {
      const shiftHueDown = shiftHslHue(h - factor * (i + 1))
      const shiftHueUp = shiftHslHue(h + factor * (i + 1))

      hueModulation.push({ h: shiftHueDown, s, l })
      hueModulation.unshift({ h: shiftHueUp, s, l })
    }

    return hueModulation
  }

  static generateRandom(count = 5, factor = 40) {
    const colorsToGenerate = count - 1

    // there's surely a more sophisticated way to generate nice-looking
    // random palettes. I'll put that in eventually.
    //
    // ...the palettes onyx generates on her own aren't very pretty yet...
    // sorry about that...I will help you get better!
    let initialHue = getRandomInt(0, 360, true)
    let initialSat = getRandomInt(20, 100, true)
    let initialLightness = getRandomInt(10, 90, true)

    const { h, s, l } = {
      h: initialHue,
      s: initialSat,
      l: initialLightness,
    }

    const hueModulation = [{ h, s, l }]

    for (var i = 0; i < colorsToGenerate; i++) {
      const darken = shiftHslHue(h - factor * i)
      const lighten = shiftHslHue(h + factor * i)

      hueModulation.push({ h: darken, s, l })
      hueModulation.unshift({ h: lighten, s, l })
    }

    return hueModulation
  }

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

  updatePalettes() {
    if (this.colorList.items.length === 0) return

    const currentPalettes = minerva.get(PALETTES)

    minerva.set(PALETTES, {
      ...currentPalettes,
      [this.id]: this.colorList.items,
    })
  }
}

export default Palette
