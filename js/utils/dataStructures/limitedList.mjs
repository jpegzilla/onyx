import { minerva, arachne } from './../../main.mjs'

/**
 * a list that can only be a certain length before starting to
 * remove the oldest items.
 */
class LimitedList {
  /**
   * creates a new limited list.
   * @param {number} limit        the maximum amount of items to hold
   * @param {number} initializer  an initial set of items
   */
  constructor({ limit, initializer = [] }) {
    this.limit = limit
    this.items = [...initializer]
    this.redoList = []
  }

  setAt(index, item) {
    this.items[index] = item

    return this
  }

  removeAt(index) {
    this.items.splice(index, 1)

    return this
  }

  undo() {
    const item = this.items.pop()

    if (item) this.redoList.push(item)

    return this
  }

  redo() {
    const item = this.redoList.pop()

    if (item) this.items.push(item)

    return this
  }

  current() {
    return this.items.at(-1)
  }

  add(item) {
    if (this.items.length >= this.limit) this.items.shift()

    this.items.push(item)
    this.redoList = []

    return this
  }

  save(key) {
    if (!key) {
      arachne.error('no key provided to LimitedList.save')
      return
    }

    minerva.set(key, this.items)
  }

  clear() {
    this.items = []

    return this
  }
}

export default LimitedList
