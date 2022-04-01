import Component from './component.mjs'
import { html } from './../utils/index.mjs'

class DataDisplay extends Component {
  constructor() {
    super()

    this.id = 'datadisplay'
  }

  connectedCallback() {
    this.innerHTML = html` <section class="data-display-container"></section> `
  }
}

export default { name: 'onyx-data-display', element: DataDisplay }
