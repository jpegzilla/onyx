import Component from './component.mjs'
import { html } from './../utils/index.mjs'

class Box extends Component {
  static name = 'box'

  constructor() {
    super()
  }

  connectedCallback() {
    this.innerHTML = html` <div>I am a box!!!</div> `
  }
}

export default { name: Box.name, element: Box }
