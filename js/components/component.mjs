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

  setId(id) {
    this.id = id
  }

  attr(name, val) {
    return val ? this.setAttribute(name, val) : this.getAttribute(name)
  }
}

export default Component