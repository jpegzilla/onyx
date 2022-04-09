import Component from './component.mjs'
import { html, setCustomProperty } from './../utils/index.mjs'
import { minerva } from './../main.mjs'

const conversionWorker = './js/workers/colorConversion.worker.mjs'

class ColorDisplay extends Component {
  static name = 'onyx-color-display'

  constructor() {
    super()

    this.id = this.name
    this.colors = minerva.get('colors')
    this.activeColor = 'fg'

    this.conversionWorker = new Worker(conversionWorker, { type: 'module' })
  }

  updateColors(fg, bg) {
    this.querySelector('.foreground-color-value').textContent = fg
    this.querySelector('.background-color-value').textContent = bg

    this.getConversions(fg)
  }

  getConversions(hexColor) {
    this.conversionWorker.addEventListener('message', ({ data }) => {
      minerva.place('colorConversions', data)
      // const conversions = ['rgba', 'hsla', 'hwb', 'lab', 'lch', 'xyz']
      //
      // conversions.forEach(format => {
      //   this.querySelector(`.conversion-${format}`).textContent = data[format]
      // })
    })

    this.conversionWorker.postMessage(hexColor)
  }

  connectedCallback() {
    setCustomProperty('--color-display-color', minerva.get('colors').fg)

    this.innerHTML = html`
      <section class="color-display-container">
        <div class="hex-value-foreground">
          <div class="foreground-color-name">foreground</div>
          <div class="foreground-color-value">#000000</div>
        </div>

        <div class="hex-value-background">
          <div class="background-color-name">background</div>
          <div class="background-color-value">#000000</div>
        </div>

        <div class="color-display-conversions">
          <div class="conversion-rgba"></div>
          <div class="conversion-hsla"></div>
          <div class="conversion-hwb"></div>
          <div class="conversion-lab"></div>
          <div class="conversion-lch"></div>
          <div class="conversion-xyz"></div>
        </div>
      </section>
    `

    minerva.on('colors', ({ fg, bg }) => {
      this.updateColors(fg, bg)
    })
  }
}

export default { name: ColorDisplay.name, element: ColorDisplay }
