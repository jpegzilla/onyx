import { env } from './../meta.mjs'
const { ARACHNE_TRACE, ARACHNE_SILENT } = env

/**
 * Arachne - wrapper for pretty logs
 */
class Arachne {
  static #onlyShowPreLog(message) {
    if (ARACHNE_SILENT) return true
    if (ARACHNE_TRACE) {
      console.trace(message)
      return true
    }

    return false
  }
  /**
   * @static log - outputs a styled message. to be used for logging messages in production.
   *
   * @param {string} message a message to show in the console.
   *
   */
  static log(message) {
    if (this.#onlyShowPreLog(message)) return

    console.log(
      `%c[arachne] ${message}`.toLowerCase(),
      'color:white;background:black;padding:0.5rem;border-left:3px solid green;'
    )
  }

  /**
   * @static warn - outputs a styled warning message. to be used for logging messages in production.
   *
   * @param {string} message a message to show in the console.
   *
   */
  static warn(message) {
    if (this.#onlyShowPreLog(message)) return

    console.log(
      `%c[arachne] ${message}`.toLowerCase(),
      'color:white;background:black;padding:0.5rem;border-left:3px solid orange;'
    )
  }

  /**
   * @static error - outputs a styled error message. to be used for logging messages in production.
   *
   * @param {string} message a message to show in the console.
   *
   */
  static error(message) {
    if (this.#onlyShowPreLog(message)) return

    console.log(
      `%c[arachne] ${message}`.toLowerCase(),
      'color:white;background:black;padding:0.5rem;border-left:3px solid red;'
    )
  }
}

export default Arachne
