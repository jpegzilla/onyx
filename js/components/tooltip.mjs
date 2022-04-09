import Component from './component.mjs'
import { html } from './../utils/index.mjs'

class Tooltip extends Component {
  static name = 'onyx-tooltip'

  constructor() {
    super()

    this.position = [0, 0]
  }

  updatePosition(mousePosition) {}

  maybeRemove(attachedTo) {}

  showTooltip(mousePosition) {}

  render() {
    this.innerHTML = html`<div>I am a tooltip</div>`
  }

  connectedCallback() {
    this.render()
  }
}

export default { name: Tooltip.name, element: Tooltip }
