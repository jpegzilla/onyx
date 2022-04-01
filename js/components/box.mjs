import Component from './component.mjs'
import { html } from './../utils/index.mjs'

class Box extends Component {
  constructor() {
    super()

    this.name = 'box'
  }

  connectedCallback() {
    this.innerHTML = html` <div>I am a box!!!</div> `
  }
}

export default { name: 'box-component', element: Box }
