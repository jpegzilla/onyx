import Component from './component.mjs'
import { html } from './../utils/index.mjs'

class Sidebar extends Component {
  static name = 'onyx-sidebar'

  constructor() {
    super()

    this.id = Sidebar.name
  }

  connectedCallback() {
    this.innerHTML = html` <section class="sidebar-container"></section> `
  }
}

export default { name: Sidebar.name, element: Sidebar }
