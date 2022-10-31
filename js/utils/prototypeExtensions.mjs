/**
 * Number.between
 * used to check if a number is between a given maximum and minimum.
 * @param  {number}  min bottom bound of range to check
 * @param  {number}  max upper bound of range to check
 * @param  {boolean} [inclusive=false] max and min inclusive?
 * @return {boolean} true if number is between max and min
 */
Number.prototype.between = function (min, max, inclusive = false) {
  if (isNaN(min) || isNaN(max))
    throw TypeError('minimum and maximum parameters must be numbers.')

  if (min > max) throw RangeError('minimum must be less than maximum.')

  return inclusive ? this >= min && this <= max : this > min && this < max
}

Object.defineProperty(Object.prototype, 'values', {
  get: function () {
    return Object.values(this)
  },
})

Object.defineProperty(Object.prototype, 'keys', {
  get: function () {
    return Object.keys(this)
  },
})

Object.defineProperty(Object.prototype, 'entries', {
  get: function () {
    return Object.entries(this)
  },
})

/**
 * Number.sum
 * adds all the numbers in an array together, returning the sum
 * @return {number} sum of all numbers in the array
 */
Array.prototype.sum = function () {
  if (this.some(n => isNaN(n)))
    throw TypeError('all array indices must be numbers.')

  return this.reduce((a, b) => a + b)
}
