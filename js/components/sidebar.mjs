import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { minerva } from './../main.mjs'
import { palette } from './subcomponents/index.mjs'

const PALETTES = 'palettes'
const FOREGROUND = 'fg'
const ACTIVE_COLOR = 'activeColor'
const EXTERNAL_UPDATE = 'externalUpdate'
const COLORS = 'colors'

class Sidebar extends Component {
  static name = 'onyx-sidebar'

  constructor() {
    super()

    this.id = Sidebar.name
  }

  connectedCallback() {
    this.innerHTML = html`
      <div class="sidebar-container">
        <div class="palette-container"></div>
      </div>
      <div class="sidebar-container">
        <div class="palette-history-container"></div>
      </div>
    `

    minerva.on(PALETTES, p => {
      // console.log(p)
    })
  }
}

export default { name: Sidebar.name, element: Sidebar }
