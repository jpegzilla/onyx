import Component from './component.mjs'
import { html } from './../utils/index.mjs'

class Controls extends Component {
  static name = 'onyx-controls'

  constructor() {
    super()

    this.id = Controls.name
  }

  connectedCallback() {
    this.innerHTML = html`<div>controls</div>`
  }
}

export default { name: Controls.name, element: Controls }
