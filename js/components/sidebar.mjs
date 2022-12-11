import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { minerva } from './../main.mjs'

class Sidebar extends Component {
  static name = 'onyx-sidebar'

  constructor() {
    super()

    this.id = Sidebar.name
  }

  connectedCallback() {
    this.innerHTML = html`
      <section class="sidebar-container">sidebar LOL</section>
    `

    minerva.on('palettes', paletteData => {
      console.log('in sidebar, palette update recieved', paletteData)
    })
  }
}

export default { name: Sidebar.name, element: Sidebar }
