/**
 * returns a tagged template. I use this because it allows
 * my ide to format a template string similarly to regular html
 * @param  {object} literals  object containing template literals
 * @param  {Array} vars       variables passed in the template
 * @return {string}           constructed string
 */
export default (literals, ...vars) => {
  let raw = literals.raw,
    result = '',
    i = 1,
    len = vars.length + 1,
    str,
    variable

  while (i < len) {
    str = raw[i - 1]
    variable = vars[i - 1]
    result += str + variable
    i++
  }

  result += raw[raw.length - 1]

  return result
}
