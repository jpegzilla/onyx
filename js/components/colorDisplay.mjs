import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { minerva } from './../main.mjs'

const conversionWorker = './js/workers/colorConversion.worker.mjs'
const closestColorWorker = './js/workers/closestColorFromPalette.worker.mjs'

class ColorDisplay extends Component {
  static name = 'onyx-color-display'

  constructor() {
    super()

    this.id = ColorDisplay.name
    this.activeColor = minerva.get('activeColor') || 'bg'
    this.conversionWorker = new Worker(conversionWorker, { type: 'module' })
    this.closestColorWorker = new Worker(closestColorWorker, { type: 'module' })
  }

  updateReadout({ fg, bg }) {
    console.log(fg, bg)
    const readout = this.querySelector('.color-display-readout span')

    if (this.activeColor === 'bg') {
      readout.textContent = bg
    }

    if (this.activeColor === 'fg') {
      readout.textContent = fg
    }

    this.colors = {
      fg,
      bg,
    }
  }

  updateColors({ fg, bg }) {
    this.updateReadout({ fg, bg })

    this.getConversions(bg)
  }

  getConversions(hexColor) {
    this.conversionWorker.addEventListener('message', ({ data }) => {
      minerva.place('colorConversions', data)

      // console.log('color data from conversion', data)
      const conversions = Object.entries(data)

      conversions.forEach(([format, value]) => {
        const conversionElement = document.createElement('div')
        conversionElement.innerHTML = html`
          <span>${format}:</span>
          <span>${value}</span>
        `

        this.querySelector('.color-formats-extended').appendChild(
          conversionElement
        )
      })
    })

    this.closestColorWorker.addEventListener('message', ({ data }) => {
      console.log(data)
    })

    this.conversionWorker.postMessage(hexColor)
    this.closestColorWorker.postMessage('c70b5d')
  }

  connectedCallback() {
    this.innerHTML = html`
      <section class="color-display-container">
        <div class="color-display-readout"><span>#000000</span></div>
        <div class="color-display-selector">
          <div class="color-display-selector-description">
            <span>select color readout</span>
          </div>

          <button class="display-background-color" data-color="bg">
            <span>${this.activeColor === 'bg' ? '> ' : ''}background</span>
          </button>

          <button class="display-text-color" data-color="fg">
            <span>${this.activeColor === 'fg' ? '> ' : ''}text</span>
          </button>
        </div>
      </section>
      <section class="color-formats-container">
        <div class="color-formats-header">extended formats</div>
        <div class="color-formats-extended"></div>
      </section>
    `

    const displayBackgroundColor = this.querySelector(
      '.display-background-color'
    )
    const displayTextColor = this.querySelector('.display-text-color')

    const buttons = [displayBackgroundColor, displayTextColor]

    buttons.forEach((element, _idx, arr) => {
      element.addEventListener('click', e => {
        const activeColor = e.currentTarget.dataset.color
        const text = e.currentTarget.querySelector('span').textContent

        if (activeColor === this.activeColor) {
          return
        }

        e.currentTarget.querySelector('span').textContent = `> ${text}`

        arr
          .filter(
            elem => !elem.classList.contains(e.currentTarget.classList[0])
          )
          .forEach(e => {
            const textContent = e.querySelector('span').textContent

            e.querySelector('span').textContent = textContent
              .replace('>', '')
              .trim()
          })

        minerva.set('activeColor', activeColor)
      })
    })

    minerva.on('activeColor', color => {
      this.activeColor = color
      this.updateReadout({
        fg: minerva.get('colors').fg,
        bg: minerva.get('colors').bg,
      })
    })

    minerva.on('colors', ({ fg, bg }) => {
      this.updateColors({ fg, bg })
    })
  }
}

export default { name: ColorDisplay.name, element: ColorDisplay }
