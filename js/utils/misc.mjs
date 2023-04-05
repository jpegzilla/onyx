import arachne from './arachne.mjs'

/**
 * adds a "hotkey" listener to the window.
 * @param  {string}   key  the key to bind
 * @param  {Function} fn   a function run when hitting the hotkey
 */
export const hotkey = (key, fn) => {
  addEventListener('keydown', ({ key: eventKey, repeat }) => {
    if (repeat) return
    if (eventKey === key) fn()
  })
}

export const keycodes = {
  space: ' ',
  enter: 'Enter',
}

/**
 * add multiple event listeners to an element
 * @param {HTMLElement}   element  the element to add the listeners to
 * @param {Array<string>} events   an array of event types
 * @param {Function}      fn       callback to execute for each event
 */
export const addMultiListener = (element, events, fn) => {
  events.forEach(ev => {
    element.addEventListener(ev, fn)
  })
}

/**
 * interleaves two arrays.
 * @param  {Array} a1  the first array
 * @param  {Array} a2  the second array
 * @return {Array}     an interleaved array
 */
export const interleave = (a1, a2) => {
  return a1.map((val, idx) => [val, a2[idx]])
}

const keys = {
  37: 1,
  38: 1,
  39: 1,
  40: 1,
}

/**
 * prevents the default action for an event
 * @param  {Event} e  the event to be prevented
 */
const preventDefault = e => {
  e = e || window.event
  if (e.preventDefault) e.preventDefault()
  e.returnValue = false
}

/**
 * prevents the default action for a key event
 * @param  {KeyboardEvent} e  the event to be prevented
 */
const preventDefaultForScrollKeys = e => {
  if (keys[e.keyCode]) {
    preventDefault(e)
    return false
  }
}

/**
 * prevents all scrolling on the page
 */
export const disableScroll = () => {
  if (addEventListener) {
    addEventListener('DOMMouseScroll', preventDefault, false)
  }
  document.addEventListener('wheel', preventDefault, {
    passive: false,
  })
  window.onwheel = preventDefault
  window.onmousewheel = document.onmousewheel = preventDefault
  window.ontouchmove = preventDefault
  document.onkeydown = preventDefaultForScrollKeys
}

/**
 * enables all scrolling on the page
 */
export const enableScroll = () => {
  if (removeEventListener) {
    removeEventListener('DOMMouseScroll', preventDefault, false)
  }
  document.removeEventListener('wheel', preventDefault, {
    passive: false,
  })
  window.onmousewheel = document.onmousewheel = null
  window.onwheel = null
  window.ontouchmove = null
  document.onkeydown = null
}

/**
 * gets a random integer between two given numbers
 * @param  {Number}  min       minimum bound for number generation
 * @param  {Number}  max       maximum bound for number generation
 * @param  {Boolean} inclusive true if max range is inclusive
 * @return {Number}            a random number between max and min
 */
export const getRandomInt = (min, max, inclusive = false) => {
  if (isNaN(min) || isNaN(max)) {
    arachne.error('getRandomInt must be called with two numbers.')
    return
  }

  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + +inclusive)) + min // the maximum is exclusive and the minimum is inclusive
}

/**
 * generates a valid uuidv4
 * @return {string} a uuidv4
 */
export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * throttle - fires a callback *only* every x seconds
 *
 * @param {function} fn         the callback to trigger
 * @param {number}   threshold  how often the callback should be able to fire
 *
 * @returns {function} function that fires the callback
 */
export const throttle = (fn, threshold) => {
  threshold || (threshold = 250)

  let last, deferTimer

  return () => {
    const now = +new Date()
    if (last && now < last + threshold) {
      // hold on to it
      clearTimeout(deferTimer)
      deferTimer = setTimeout(() => {
        last = now
        fn.apply()
      }, threshold)
    } else {
      last = now
      fn.apply()
    }
  }
}

export const debounce = (func, timeout = 250) => {
  let timer
  return () => {
    clearTimeout(timer)
    timer = setTimeout(() => func(), timeout)
  }
}

/**
 * getAverageColor - calculates the average color of the image provided.
 *
 * @param {HTMLElement} img an html <img> element containing the image
 * that you want to get the average color of.
 *
 * @returns {object} object containing r, g, and b values for the
 * calculated average color
 */
export const getAverageColor = img => {
  const blockSize = 5
  const canvas = document.createElement('canvas')
  const rgb = { r: 0, g: 0, b: 0 }
  const context = canvas.getContext('2d')

  canvas.width = img.naturalWidth || img.offsetWidth || img.width
  canvas.height = img.naturalHeight || img.offsetHeight || img.height

  let i = -4
  let count = 0
  const { width, height } = canvas

  context.drawImage(img, 0, 0)

  const { data } = context.getImageData(0, 0, width, height)
  const length = data.data.length

  while ((i += blockSize * 4) < length) {
    ++count
    rgb.r += data[i]
    rgb.g += data[i + 1]
    rgb.b += data[i + 2]
  }

  rgb.r = ~~(rgb.r / count)
  rgb.g = ~~(rgb.g / count)
  rgb.b = ~~(rgb.b / count)

  return rgb
}

/**
 * gets url parameters from current url.
 * @return {object} a set of key-value pairs of url params.
 */
export const getUrlParams = () => {
  const vars = {}
  const regex = /[?&]+([^=&]+)=([^&]*)/gi
  window.location.href.replace(regex, (_, key, val) => (vars[key] = val))
  return vars
}

/**
 * sets a custom property on the root element
 * @param {string} property  property to set
 * @param {string} value     value to assign to the property
 */
export const setCustomProperty = (property, value) => {
  document.documentElement.style.setProperty(property, value)
}

/**
 * gets a custom property from the root element
 * @param  {string} property  property to retrieve
 * @return {string} the value of the requested property
 */
export const getCustomProperty = property => {
  return getComputedStyle(document.querySelector(':root'))
    .getPropertyValue(property)
    .trim()
}

/**
 * used to determine whether worker modules can be implemented.
 * @return {Promise} a promise that resolves with true if import statements in workers are supported.
 */
export const supportsImportInWorkers = () => {
  return new Promise(resolve => {
    try {
      const dummyWorker = new Worker('./js/workers/dummy.worker.mjs')

      dummyWorker.addEventListener('message', ({ data }) => {
        if (data === 'error') resolve(false)
        else resolve(true)
      })
    } catch {
      resolve(false)
    }
  })
}

export const objectComparison = (objectA, objectB) => {
  return JSON.stringify(objectA) === JSON.stringify(objectB)
}

/**
 * converts a digit in 0-255 to 4-bit hex string
 * @param  {number} d number between 0 and 255
 * @return {string}   zero-padded hexadecimal string
 */
export const zeroPaddedHex = d => (+d).toString(16).padStart(2, '0')

export const downloadHexadecimalData = (data, filename, extension) => {
  const hexData = data.replaceAll(' ', '')
  let byteArray = new Uint8Array(hexData.length / 2)

  for (let i = 0; i < byteArray.length; i++) {
    byteArray[i] = parseInt(hexData.substr(i * 2, 2), 16)
  }

  const blob = new Blob([byteArray], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)

  return {
    href: url,
    download: `${filename}.${extension}`,
  }
}

export const downloadTextData = (data, filename, extension) => {
  return {
    href: `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`,
    download: `${filename}.${extension}`,
  }
}

export const downloadImageData = (canvas, filename) => {
  const dataURI = canvas.toDataURL()

  return {
    href: dataURI,
    download: `${filename}.png`,
  }
}
