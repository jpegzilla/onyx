import Component from './component.mjs'
import { html, setCustomProperty } from './../utils/index.mjs'
import { minerva } from './../main.mjs'

class ColorDisplay extends Component {
  constructor() {
    super()

    this.id = 'colordisplay'
    this.colors = minerva.get('colors')
    this.activeColor = 'fg'

    this.conversionWorker = new Worker(
      './js/workers/colorConversion.worker.mjs'
    )
  }

  updateColors(fg, bg) {
    this.querySelector('.hex-value-foreground').textContent = fg
    this.querySelector('.hex-value-background span').textContent = bg
  }

  getConversions(hexColor) {
    this.conversionWorker.addEventListener('message', ({ data }) => {
      console.log(data)
    })

    this.conversionWorker.postMessage(hexColor)
  }

  connectedCallback() {
    setCustomProperty('--color-display-color', minerva.get('colors').fg)

    this.innerHTML = html`
      <section class="color-display-container">
        <div class="hex-value-foreground">#000000</div>
        <div class="hex-value-background">background: <span>#000000</span></div>
      </section>
    `

    this.updateColors()
    this.getConversions(minerva.get('colors').fg)

    minerva.on('colors', ({ fg, bg }) => {
      this.updateColors(fg, bg)
    })
  }
}

export default { name: 'onyx-color-display', element: ColorDisplay }
