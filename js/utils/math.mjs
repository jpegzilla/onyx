/**
 * normalize an array of numbers to a given range
 * @param  {array} set            array of numbers to normalize
 * @param  {array} [range=[0, 1]] range to normalize to
 * @return {array}                normalized set
 */
export const normalize = (set, range = [0, 1]) => {
  if (range.length > 2 || !Array.isArray(set) || !Array.isArray(range))
    throw new Error('invalid arguments to normalize')

  const min = Math.min(...set)
  let newSet = set.map(n => n - min)
  const max = Math.max(...newSet)
  newSet = newSet.map(n => n / max)

  // newSet is now in range [0, 1]

  let newRange = range[1] - range[0]
  let initial = range[0]

  // normalized = (array * new range) + range[0];

  return newSet.map(n => n * newRange + initial)
}

/**
 * convert a decimal floating-point number to 32 bit hexadecimal
 * @param  {number} float number to convert
 * @return {array}        array of hex bytes
 */
export const floatToHex = float => {
  const view = new DataView(new ArrayBuffer(4))
  view.setFloat32(0, float)

  return new Array(4)
    .fill()
    .map((_, i) => view.getUint8(i).toString(16).toUpperCase().padStart(2, '0'))
    .join(' ')
}

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
