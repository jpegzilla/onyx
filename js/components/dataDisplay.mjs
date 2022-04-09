import Component from './component.mjs'
import { html } from './../utils/index.mjs'

class DataDisplay extends Component {
  static name = 'onyx-data-display'

  constructor() {
    super()

    this.id = this.name
  }

  connectedCallback() {
    this.innerHTML = html` <section class="data-display-container"></section> `
  }
}

export default { name: DataDisplay.name, element: DataDisplay }
