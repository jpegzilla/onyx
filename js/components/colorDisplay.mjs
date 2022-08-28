import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { minerva } from './../main.mjs'
import closestColorNonWorker from './../workers/closestColorFromPalette.nonWorker.mjs'
import conversionNonWorker from './../workers/colorConversion.nonWorker.mjs'
import harmonyNonWorker from './../workers/colorHarmonies.nonWorker.mjs'

const conversionWorker = './js/workers/colorConversion.worker.mjs'
const closestColorWorker = './js/workers/closestColorFromPalette.worker.mjs'
const harmonyWorker = './js/workers/colorHarmonies.worker.mjs'

/**
 * area in which information about the currently selected color is
 * displayed.
 * @extends Component
 */
class ColorDisplay extends Component {
  static name = 'onyx-color-display'

  constructor() {
    super()

    this.id = ColorDisplay.name
    this.activeColor = minerva.get('activeColor') || 'bg'

    this.shouldUseWorkers = minerva.get('supportsImportInWorkers')
  }

  handleClosestColorData({ data }) {
    console.log('closest colors in other palettes', data)

    minerva.place('otherColorPalettes', data)

    const conversions = Object.entries(data)
    let conversionsHTML = ``

    conversions.forEach(([format, { name, code, hex }]) => {
      conversionsHTML += html`
        <div class="color-info-format-container">
          <span class="color-info-format">${format} analogue</span>
          <span class="color-info-unit"
            >${name}${code ? ' [' + code + '] ' : ''} (${hex})</span
          >
        </div>
      `
    })

    console.log('conversions to other formats', data)

    this.querySelector(
      '.color-info-container.palettes .color-info-container-list'
    ).innerHTML = conversionsHTML
  }

  handleHarmonyData({ data }) {
    console.log('color harmonies', data)
  }

  handleConversionData({ data }) {
    minerva.place('colorConversions', data)

    const conversions = Object.entries(data)
    let conversionsHTML = ``

    conversions.forEach(([format, value]) => {
      conversionsHTML += html`
        <div class="color-info-format-container">
          <span class="color-info-format">${format}</span>
          <span class="color-info-unit">${value}</span>
        </div>
      `
    })

    console.log('conversions to other formats', data)

    this.querySelector(
      '.color-info-container.conversions .color-info-container-list'
    ).innerHTML = conversionsHTML
  }

  /**
   * updates the color readout in the onyx interface.
   * @arg {Object} args - updateReadout parameters
   * @arg {String} args.fg - foreground color
   * @arg {String} args.bg - background color
   */
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

  getConversions(hexColor) {
    if (this.shouldUseWorkers) {
      this.conversionWorker.postMessage(hexColor)
      this.closestColorWorker.postMessage(hexColor)
      this.harmonyWorker.postMessage(hexColor)
    } else {
      const conversionData = conversionNonWorker({ data: hexColor })
      this.handleConversionData({ data: conversionData })

      const closestColorData = closestColorNonWorker({ data: hexColor })
      this.handleClosestColorData({ data: closestColorData })

      const harmonyData = harmonyNonWorker({ data: hexColor })
      this.handleHarmonyData({ data: harmonyData })
    }
  }

  /**
   * updates colors on the display - changes the readout and gets the closest color match along with conversions to the other color formats.
   * @arg {Object} args - updateColors parameters
   * @arg {String} args.fg - foreground color
   * @arg {String} args.bg - background color
   */
  updateColors({ fg, bg }) {
    this.updateReadout({ fg, bg })

    switch (this.activeColor) {
      case 'fg':
        this.getConversions(fg)
        break
      case 'bg':
        this.getConversions(bg)
    }
  }

  setupWorkers() {
    if (this.shouldUseWorkers) {
      this.conversionWorker = new Worker(conversionWorker, { type: 'module' })
      this.closestColorWorker = new Worker(closestColorWorker, {
        type: 'module',
      })
      this.harmonyWorker = new Worker(harmonyWorker, { type: 'module' })

      this.conversionWorker.addEventListener('message', ({ data }) =>
        this.handleConversionData({ data })
      )
      this.closestColorWorker.addEventListener('message', ({ data }) =>
        this.handleClosestColorData({ data })
      )
      this.harmonyWorker.addEventListener('message', ({ data }) =>
        this.handleHarmonyData({ data })
      )
    }
  }

  connectedCallback() {
    this.innerHTML = html`
      <div>
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

        <section class="color-info-container conversions">
          <div class="color-info-container-list"></div>
        </section>

        <section class="color-info-container palettes">
          <div class="color-info-container-list"></div>
        </section>
      </div>
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
      this.updateColors({
        fg: minerva.get('colors').fg,
        bg: minerva.get('colors').bg,
      })
    })

    minerva.on('colors', ({ fg, bg }) => {
      this.updateColors({ fg, bg })
    })

    this.setupWorkers()
  }
}

export default { name: ColorDisplay.name, element: ColorDisplay }
