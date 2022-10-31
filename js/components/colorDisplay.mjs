import Component from './component.mjs'
import { html, objectComparison, setCustomProperty } from './../utils/index.mjs'
import { minerva } from './../main.mjs'
import {
  hslToHex,
  stringifyHSL,
  MODE_HEX,
  MODE_HSL,
  MODE_RGB,
} from './../utils/color/index.mjs'
import closestColorNonWorker from './../workers/closestColorFromPalette.nonWorker.mjs'
import conversionNonWorker from './../workers/colorConversion.nonWorker.mjs'
import harmonyNonWorker from './../workers/colorHarmonies.nonWorker.mjs'
import { checkForEgg } from './../utils/managers/easterEggManager.mjs'

const conversionWorker = './js/workers/colorConversion.worker.mjs'
const closestColorWorker = './js/workers/closestColorFromPalette.worker.mjs'
const harmonyWorker = './js/workers/colorHarmonies.worker.mjs'

const HARMONIES = 'colorHarmonies'
const CONVERSIONS = 'colorConversions'
const OTHER_PALETTES = 'otherColorPalettes'
const ACTIVE_COLOR = 'activeColor'
const BACKGROUND = 'bg'
const FOREGROUND = 'fg'

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
    this.activeColor = minerva.get(ACTIVE_COLOR) || BACKGROUND

    this.shouldUseWorkers = minerva.get('supportsImportInWorkers')
  }

  isOldData(data, key) {
    return minerva.pick(key) && objectComparison(data, minerva.pick(key))
  }

  handleClosestColorData({ data }) {
    if (this.isOldData(data, OTHER_PALETTES)) return

    // console.log('closest colors in other palettes', data)

    minerva.place(OTHER_PALETTES, data)

    const otherPalettes = Object.entries(data)
    let otherPalettesHTML = ``

    otherPalettes.forEach(([format, { name, code, hex }]) => {
      otherPalettesHTML += html`
        <div class="color-info-format-container">
          <span class="color-info-format">${format.padEnd(10)}</span>
          <span class="color-info-unit"
            >${name}${code ? ' [' + code + '] ' : ''}</span
          >
        </div>
      `
    })

    // console.log('analogues in other palettes', data)

    this.qs(
      '.color-info-container.palettes .color-info-container-list'
    ).innerHTML = otherPalettesHTML
  }

  handleHarmonyData({ data }) {
    if (this.isOldData(data, HARMONIES)) return

    // console.log('color harmonies', data)
  }

  handleConversionData({ data }) {
    if (this.isOldData(data, CONVERSIONS)) return

    minerva.place(CONVERSIONS, data)

    const conversions = Object.entries(data)
    let conversionsHTML = ``

    conversions.forEach(([format, value]) => {
      conversionsHTML += html`
        <div class="color-info-format-container">
          <span class="color-info-format">${format.padEnd(10)}</span>
          <span class="color-info-unit">${value}</span>
        </div>
      `
    })

    // console.log('conversions to other formats', data)

    this.qs(
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
    const readout = this.qs(
      '.color-display-readout .color-display-hex-code span'
    )

    if (this.activeColor === BACKGROUND) {
      readout.textContent = bg.replace('#', '')
    }

    if (this.activeColor === FOREGROUND) {
      readout.textContent = fg.replace('#', '')
    }

    this.colors = {
      fg,
      bg,
    }
  }

  getConversions(color, format, hexColor) {
    const conversionMessage = { color, format }

    if (this.shouldUseWorkers) {
      this.conversionWorker.postMessage(conversionMessage)
      this.closestColorWorker.postMessage({ color: hexColor })
      this.harmonyWorker.postMessage(conversionMessage)
    } else {
      const conversionData = conversionNonWorker({ data: conversionMessage })
      this.handleConversionData({ data: conversionData })

      const closestColorData = closestColorNonWorker({
        data: conversionMessage,
      })
      this.handleClosestColorData({ data: closestColorData })

      const harmonyData = harmonyNonWorker({ data: conversionMessage })
      this.handleHarmonyData({ data: harmonyData })
    }
  }

  /**
   * updates colors on the display - changes the readout and gets the closest color match along with conversions to the other color formats.
   * @arg {Object} args - updateColors parameters
   * @arg {String} args.fg - foreground color
   * @arg {String} args.bg - background color
   */
  updateColors({ fg, bg }, colorsToConvert) {
    this.updateReadout({ fg, bg })

    const easterEgg = checkForEgg(colorsToConvert)?.name

    if (easterEgg) {
      minerva.set('headerEasterEgg', easterEgg)
    } else {
      minerva.set('headerEasterEgg', '')
    }

    const { fg: conversionFg, bg: conversionBg } = colorsToConvert

    switch (this.activeColor) {
      case FOREGROUND:
        this.getConversions(conversionFg, minerva.get('colorMode'), fg)
        break
      case BACKGROUND:
        this.getConversions(conversionBg, minerva.get('colorMode'), bg)
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
          <div class="color-display-readout">
            <span class="color-display-hex-code">#<span>000000</span></span>
          </div>
          <div class="color-display-selector">
            <div class="color-display-selector-description">
              <span>select color readout</span>
            </div>

            <button class="display-background-color" data-color="bg">
              <span
                >${this.activeColor === BACKGROUND ? '> ' : ''}background</span
              >
            </button>

            <button class="display-text-color" data-color="fg">
              <span>${this.activeColor === FOREGROUND ? '> ' : ''}text</span>
            </button>
          </div>
        </section>

        <section class="color-info-container conversions">
          <div class="color-info-container-header">
            <span>conversions to other formats</span>
            <b class="border-bottom"></b>
          </div>
          <div class="color-info-container-list"></div>
        </section>

        <section class="color-info-container palettes">
          <div class="color-info-container-header">
            <span>close analogues from external color systems</span>
            <b class="border-bottom"></b>
          </div>
          <div class="color-info-container-list"></div>
        </section>
      </div>
    `

    const displayBackgroundColor = this.qs('.display-background-color')
    const displayTextColor = this.qs('.display-text-color')

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

        minerva.set(ACTIVE_COLOR, activeColor)
      })
    })

    minerva.on(ACTIVE_COLOR, color => {
      const { fg: hslFg, bg: hslBg } = minerva.get('colors')
      this.activeColor = color
      this.updateColors(
        {
          fg: hslToHex(hslFg),
          bg: hslToHex(hslBg),
        },
        {
          fg: hslFg,
          bg: hslBg,
        }
      )
    })

    minerva.on('colors', ({ fg, bg }) => {
      const mode = minerva.get('colorMode')
      let colorsToConvert

      // display always needs to take hex colors
      const colorsToDisplay = { fg: hslToHex(fg), bg: hslToHex(bg) }

      switch (mode) {
        case MODE_HSL:
          colorsToConvert = {
            fg,
            bg,
          }

          break
        case MODE_HEX:
          colorsToConvert = { fg: hslToHex(fg), bg: hslToHex(bg) }
          break
        case MODE_RGB:
          // TODO: give this some functionality
          break
      }

      this.updateColors(colorsToDisplay, colorsToConvert)

      setCustomProperty('--text-color', stringifyHSL(fg))
      setCustomProperty('--color-display-color', stringifyHSL(fg))

      setCustomProperty('--bg-color', stringifyHSL(bg))
      setCustomProperty('--color-display-background', stringifyHSL(bg))
    })

    this.setupWorkers()
  }
}

export default { name: ColorDisplay.name, element: ColorDisplay }
