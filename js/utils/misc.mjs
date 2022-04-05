import arachne from './arachne.mjs'

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

export const addMultiListener = (element, events, fn) => {
  events.forEach(ev => {
    element.addEventListener(ev, fn)
  })
}

export const interleave = (a1, a2) => {
  return a1.map((val, idx) => [val, a2[idx]])
}

const keys = {
  37: 1,
  38: 1,
  39: 1,
  40: 1,
}

const preventDefault = e => {
  e = e || window.event
  if (e.preventDefault) e.preventDefault()
  e.returnValue = false
}

const preventDefaultForScrollKeys = e => {
  if (keys[e.keyCode]) {
    preventDefault(e)
    return false
  }
}

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

export const getRandomInt = (min, max) => {
  if (isNaN(min) || isNaN(max)) {
    arachne.error('getRandomInt must be called with two numbers.')
    return
  }

  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min // the maximum is exclusive and the minimum is inclusive
}

export const replaceAt = (string, index, replaceWith) =>
  string.substr(0, index) +
  replaceWith +
  this.substr(index + replaceWith.length)

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
 * @param {function} callback the callback to trigger
 * @param {number}   delay    how often the callback should be able to fire
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

  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count)
  rgb.g = ~~(rgb.g / count)
  rgb.b = ~~(rgb.b / count)

  return rgb
}

export const getUrlParams = () => {
  const vars = {}
  const regex = /[?&]+([^=&]+)=([^&]*)/gi
  window.location.href.replace(regex, (_, key, val) => (vars[key] = val))
  return vars
}

export const setCustomProperty = (property, value) => {
  document.documentElement.style.setProperty(property, value)
}

export const getCustomProperty = property => {
  return getComputedStyle(document.querySelector(':root'))
    .getPropertyValue(property)
    .trim()
}
