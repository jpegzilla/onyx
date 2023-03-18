import './../utils/prototypeExtensions.mjs'
import './../utils/color/conversions.mjs'

global.localStorage = {
  state: {},
  setItem(key, item) {
    this.state[key] = item
  },
  getItem(key) {
    return this.state[key]
  },
}
