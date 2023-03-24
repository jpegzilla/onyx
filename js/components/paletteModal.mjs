import Component from './component.mjs'
import { html } from './../utils/index.mjs'

class PaletteModal extends Component {
  static name = 'onyx-palette-modal'

  constructor() {
    super()

    this.id = PaletteModal.name
  }

  connectedCallback() {
    this.innerHTML = html`<section class="palette-modal-container">
      (palette modal)
    </section>`
  }
}

export default { name: PaletteModal.name, element: PaletteModal }
