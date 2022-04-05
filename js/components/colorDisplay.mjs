import Component from './component.mjs'
import { html, setCustomProperty } from './../utils/index.mjs'
import { minerva } from './../main.mjs'

const conversionWorker = './js/workers/colorConversion.worker.mjs'

class ColorDisplay extends Component {
  constructor() {
    super()

    this.id = 'colordisplay'
    this.colors = minerva.get('colors')
    this.activeColor = 'fg'

    this.conversionWorker = new Worker(conversionWorker, { type: 'module' })
  }

  updateColors(fg, bg) {
    this.querySelector('.hex-value-foreground').textContent = fg
    this.querySelector('.hex-value-background span').textContent = bg

    this.getConversions(fg)
  }

  getConversions(hexColor) {
    this.conversionWorker.addEventListener('message', ({ data }) => {
      const conversions = ['rgba', 'hsla', 'hwb', 'lab', 'lch', 'xyz']

      conversions.forEach(format => {
        this.querySelector(`.conversion-${format}`).textContent = data[format]
      })
    })

    this.conversionWorker.postMessage(hexColor)
  }

  connectedCallback() {
    setCustomProperty('--color-display-color', minerva.get('colors').fg)

    this.innerHTML = html`
      <section class="color-display-container">
        <div class="hex-value-foreground">#000000</div>
        <div class="hex-value-background">background: <span>#000000</span></div>
        <div class="color-display-conversions">
          <div class="conversion-rgba"></div>
          <div class="conversion-hsla"></div>
          <div class="conversion-hwb"></div>
          <div class="conversion-lab"></div>
          <div class="conversion-lch"></div>
          <div class="conversion-xyz"></div>
        </div>
        <input type="range" />
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
