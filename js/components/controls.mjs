import Component from './component.mjs'
import {
  html,
  LimitedList,
  throttle,
  setCustomProperty,
} from './../utils/index.mjs'
import { minerva } from './../main.mjs'

class Controls extends Component {
  static name = 'onyx-controls'

  constructor() {
    super()

    this.id = Controls.name
    this.history = new LimitedList(minerva.get('historySize'))
    this.colors = minerva.get('colors')
    this.activeColor = 'fg'
  }

  updateHistory() {
    const update = throttle(() => {
      // this.history.add()
    }, 200)

    update()
  }

  setForeground() {}

  setBackground() {}

  connectedCallback() {
    setCustomProperty('--color-display-color', minerva.get('colors').fg)
    setCustomProperty('--color-display-background', minerva.get('colors').bg)

    this.controlInputs = this.querySelectorAll('.color-control')

    this.innerHTML = html`<section>
      <header></header>
      <div class="controls-container">
        <div class="controls-left"></div>
        <div class="controls-right"></div>
      </div>
    </section>`
  }
}

export default { name: Controls.name, element: Controls }
