/**
 * Arachne - wrapper for pretty logs
 */
class Arachne {
  /**
   * @static log - outputs a styled message. to be used for logging messages in production.
   *
   * @param {string} message a message to show in the console.
   *
   */
  static log(message) {
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
    console.log(
      `%c[arachne] ${message}`.toLowerCase(),
      'color:white;background:black;padding:0.5rem;border-left:3px solid red;'
    )
  }
}

export default Arachne
