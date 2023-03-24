const utils = {
  keymap: {
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    a: 65,
    alt: 18,
    b: 66,
    c: 67,
    caps: 20,
    ctrl: 17,
    d: 68,
    down: 40,
    e: 69,
    enter: 13,
    equal: 187,
    start: 13,
    f: 70,
    f1: 112,
    f10: 121,
    f11: 122,
    f12: 123,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    left: 37,
    m: 77,
    minus: 189,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    right: 39,
    s: 83,
    shift: 16,
    space: 32,
    t: 84,
    u: 85,
    up: 38,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,
  },

  arraysEqual: function (a, b) {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a.length != b.length) return false

    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
    return true
  },
}

/**
 * class for creating cheatcodes / hotkeys.
 */
export default class CheatCode {
  /**
   * create a new cheatcode.
   * @param {String|Array} code         string or array character combination
   * @param {Function}     callback     what to do when the hotkey is triggered
   * @param {Number}       [delay=1000] time allowed between inputs
   */
  constructor(code, callback, delay = 1000) {
    if (!code) throw new Error('a cheatcode argument is required!')
    if (typeof code != 'object' && typeof code != 'string')
      throw new Error('a cheatcode must be an array or a string!')
    if (!callback) throw new Error('a callback argument is required!')

    // set up the cheatcode in the required format
    const formatCode = code => {
      let newString = []
      switch (typeof code) {
        case 'object': // if the cheatcode is provided as an array
          code.forEach(c => {
            if (Object.keys(utils.keymap).indexOf(c) >= 0) {
              newString.push(
                Object.entries(utils.keymap)[
                  Object.keys(utils.keymap).indexOf(c)
                ][1]
              )
            } else newString.push(c)

            code = newString
          })
          break
        case 'string': // if the code provided is a string
          code
            .replace(/\s*/gi, '')
            .split(',')
            .forEach(c => {
              // for each element in the code, check if there is a corresponding key
              // code in the keymap object
              if (Object.keys(utils.keymap).indexOf(c) >= 0) {
                newString.push(
                  Object.entries(utils.keymap)[
                    Object.keys(utils.keymap).indexOf(c)
                  ][1]
                )
              } else newString.push(c)

              code = newString
            })

          break
      }

      return code
    }

    this.cheatcode = formatCode(code)

    this.delay = delay

    this.progress = []

    if (typeof callback != 'function')
      throw new Error('callback argument must be of type function!')

    this.callback = callback
  }

  /**
   * remove a cheatcode listener, deactivating it.
   * @param  {EventListenerOrEventListenerObject} listener listener function
   */
  static destroy(listener) {
    window.removeEventListener('keydown', listener)
  }

  // method for listening for the key combo
  start() {
    let timeout

    const handleKeyDown = e => {
      // set the current progress in entering the cheatcode
      this.progress.push(e.which)

      // check to see if the correct code has been entered
      // if they have, fire the callback provided to the class
      if (utils.arraysEqual(this.progress, this.cheatcode)) {
        clearTimeout(timeout)
        this.progress = []
        this.callback.apply(this)
      }

      // clear the timeout so that it can reset every time a key is pressed
      clearTimeout(timeout)

      // clear the progress in the cheat code
      const clearStorage = () => {
        this.progress = []
        clearTimeout(timeout)
      }

      // set a new timeout so the user has time to finish entering the code
      timeout = setTimeout(clearStorage, this.delay)
    }

    // add the event listener to the window
    this.listener = window.addEventListener('keydown', handleKeyDown.bind(this))

    return this.listener
  }
}
