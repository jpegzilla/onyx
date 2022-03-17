import arachne from './arachne.mjs'

export const hotkey = (key, fn) => {
  window.addEventListener('keydown', ({ key: eventKey, repeat }) => {
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
  if (window.addEventListener)
    window.addEventListener('DOMMouseScroll', preventDefault, false)
  document.addEventListener('wheel', preventDefault, {
    passive: false,
  })
  window.onwheel = preventDefault
  window.onmousewheel = document.onmousewheel = preventDefault
  window.ontouchmove = preventDefault
  document.onkeydown = preventDefaultForScrollKeys
}

export const enableScroll = () => {
  if (window.removeEventListener)
    window.removeEventListener('DOMMouseScroll', preventDefault, false)
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
    let r = (Math.random() * 16) | 0,
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
    let now = +new Date()
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
 * @param {HTMLElement} imgEl an html <img> element containing the image
 * that you want to get the average color of.
 *
 * @returns {object} object containing r, g, and b values for the
 * calculated average color
 */
export const getAverageColor = imgEl => {
  let blockSize = 5, // only visit every 5 pixels
    defaultRGB = { r: 0, g: 0, b: 0 }, // for non-supporting envs
    canvas = document.createElement('canvas'),
    context = canvas.getContext && canvas.getContext('2d'),
    data,
    width,
    height,
    i = -4,
    length,
    rgb = { r: 0, g: 0, b: 0 },
    count = 0

  if (!context) {
    return defaultRGB
  }

  height = canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width

  context.drawImage(imgEl, 0, 0)

  try {
    data = context.getImageData(0, 0, width, height)
  } catch (e) {
    /* security error, img on diff domain */
    return defaultRGB
  }

  length = data.data.length

  while ((i += blockSize * 4) < length) {
    ++count
    rgb.r += data.data[i]
    rgb.g += data.data[i + 1]
    rgb.b += data.data[i + 2]
  }

  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count)
  rgb.g = ~~(rgb.g / count)
  rgb.b = ~~(rgb.b / count)

  return rgb
}
