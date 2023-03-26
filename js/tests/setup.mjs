import './../utils/prototypeExtensions.mjs'
import './../utils/color/conversions.mjs'
import { jest } from '@jest/globals'

global.localStorage = {
  state: {},
  setItem(key, item) {
    this.state[key] = item
  },
  getItem(key) {
    return this.state[key]
  },
}

global.jest = jest
