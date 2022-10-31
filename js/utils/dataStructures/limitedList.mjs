/**
 * a list that can only be a certain length before starting to
 * remove the oldest items.
 */
class LimitedList {
  /**
   * creates a new limited list.
   * @param {number} limit  the maximum amount of items to hold
   */
  constructor({ limit }) {
    this.limit = limit

    this.items = []
  }

  add(item) {
    if (this.items.length >= this.limit) {
      this.items.shift()
    }

    this.items.push(item)

    return this.items
  }

  clear() {
    this.items = []

    return this.items
  }
}

export default LimitedList
