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

  setAt(index, item) {
    this.items[index] = item

    return this
  }

  removeAt(index) {
    this.items.splice(index, 1)

    return this
  }

  add(item) {
    // console.log({
    //   items: this.items,
    //   limit: this.limit,
    // })
    if (this.items.length >= this.limit) {
      this.items.shift()
    }

    this.items.push(item)

    return this
  }

  clear() {
    this.items = []

    return this
  }
}

export default LimitedList
