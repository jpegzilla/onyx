/**
 * base class for custom elements
 * @extends HTMLElement
 */
class Component extends HTMLElement {
  addClass(className) {
    this.classList.add(className)
  }

  removeClass(className) {
    this.classList.remove(className)
  }

  toggleClass(className) {
    this.classList.toggle(className)
  }

  qs(query) {
    return this.querySelector(query)
  }

  qsa(query) {
    return this.querySelectorAll(query)
  }

  setId(id) {
    this.id = id
  }

  attr(name, val) {
    return val ? this.setAttribute(name, val) : this.getAttribute(name)
  }
}

export default Component
