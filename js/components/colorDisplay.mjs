import Component from './component.mjs'
import {
  html,
  objectComparison,
  setCustomProperty,
  supportsImportInWorkers,
} from './../utils/index.mjs'
import { minerva, colorHistory } from './../main.mjs'
import {
  hslToHex,
  stringifyHSL,
  MODE_HEX,
  MODE_HSL,
  MODE_RGB,
  getContrastRatio,
  getRandomColor,
} from './../utils/color/index.mjs'

import closestColorNonWorker from './../workers/closestColorFromPalette.nonWorker.mjs'
import conversionNonWorker from './../workers/colorConversion.nonWorker.mjs'
import { checkForEgg } from './../utils/managers/easterEggManager.mjs'

const conversionWorker = './js/workers/colorConversion.worker.mjs'
const closestColorWorker = './js/workers/closestColorFromPalette.worker.mjs'

const CONVERSIONS = 'colorConversions'
const OTHER_PALETTES = 'otherColorPalettes'
const ACTIVE_COLOR = 'activeColor'
const BACKGROUND = 'bg'
const FOREGROUND = 'fg'
const CONTRAST = 'contrastRatio'
const EXTERNAL_UPDATE = 'externalUpdate'
const COLORS = 'colors'
const COLOR_HISTORY = 'colorHistory'
const LOCKS = 'locks'

const shouldUseWorkers = await supportsImportInWorkers()

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

    this.shouldUseWorkers = shouldUseWorkers
    minerva.set('supportsImportInWorkers', shouldUseWorkers)
  }

  isOldData(data, key) {
    return minerva.pick(key) && objectComparison(data, minerva.pick(key))
  }

  handleClosestColorData({ data }) {
    if (this.isOldData(data, OTHER_PALETTES)) return

    minerva.place(OTHER_PALETTES, data)

    const otherPalettes = Object.entries(data)
    let otherPalettesHTML = ``

    otherPalettes.forEach(([format, { name, code }]) => {
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

  handleConversionData({ data }) {
    if (this.isOldData(data, CONVERSIONS)) return

    minerva.place(CONVERSIONS, data)

    let conversionsHTML = ``

    data.entries.forEach(([format, value]) => {
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

  handleContrastRatio(data) {
    const { number, string, wcag, luminance } = data

    if (this.isOldData(data, CONTRAST)) return

    minerva.place(OTHER_PALETTES, data)

    const dataToDisplay = {
      wcag2: wcag[0],
      ratio: number,
      'fg lum.': luminance.fg.toFixed(2),
      'bg lum.': luminance.bg.toFixed(2),
      'raw bg:fg': string,
    }.entries

    let dataHTML = ``

    dataToDisplay.forEach(([format, value]) => {
      dataHTML += html`
        <div class="color-info-format-container">
          <span class="color-info-format">${format.padEnd(10)}</span>
          <span class="color-info-unit">${value}</span>
        </div>
      `
    })

    this.qs(
      '.color-info-container.contrast .color-info-container-list'
    ).innerHTML = dataHTML
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
    } else {
      const conversionData = conversionNonWorker({ data: conversionMessage })
      this.handleConversionData({ data: conversionData })

      const closestColorData = closestColorNonWorker({
        data: { color: hexColor },
      })
      this.handleClosestColorData({ data: closestColorData })
    }
  }

  /**
   * updates colors on the display - changes the readout and gets the closest color match along with conversions to the other color formats.
   * @arg {Object} args - updateColors parameters
   * @arg {String} args.fg - foreground color
   * @arg {String} args.bg - background color
   */
  updateColors({ fg, bg }, colorsToConvert) {
    const format = minerva.get('colorMode')

    this.updateReadout({ fg, bg })

    // contrast ratio stuff really doesn't require
    // offloading to a worker
    const contrastRatio = getContrastRatio(colorsToConvert, format)
    this.handleContrastRatio(contrastRatio)

    const easterEgg = checkForEgg(colorsToConvert)?.name

    if (easterEgg) {
      minerva.set('headerEasterEgg', easterEgg)
    } else {
      minerva.set('headerEasterEgg', '')
    }

    const { fg: conversionFg, bg: conversionBg } = colorsToConvert

    switch (this.activeColor) {
      case FOREGROUND:
        this.getConversions(conversionFg, format, fg)
        break
      case BACKGROUND:
        this.getConversions(conversionBg, format, bg)
    }
  }

  setupWorkers() {
    if (this.shouldUseWorkers) {
      this.conversionWorker = new Worker(conversionWorker, { type: 'module' })
      this.closestColorWorker = new Worker(closestColorWorker, {
        type: 'module',
      })

      this.conversionWorker.addEventListener('message', ({ data }) =>
        this.handleConversionData({ data })
      )
      this.closestColorWorker.addEventListener('message', ({ data }) =>
        this.handleClosestColorData({ data })
      )
    }
  }

  connectedCallback() {
    this.innerHTML = html`
      <div class="color-display-container-columns">
        <div>
          <section class="color-display-container">
            <div class="color-display-readout">
              <span class="color-display-hex-code">#<span>000000</span></span>
            </div>
          </section>

          <section class="color-info-container conversions smaller-margin">
            <div class="color-info-container-header">
              <span>conversions to other formats</span>
              <!-- <b class="border-bottom"></b> -->
            </div>
            <div class="color-info-container-list"></div>
          </section>

          <section class="color-info-container palettes">
            <div class="color-info-container-header">
              <span>close analogues from external color systems</span>
              <!-- <b class="border-bottom"></b> -->
            </div>
            <div class="color-info-container-list"></div>
          </section>

          <section class="color-info-container contrast">
            <div class="color-info-container-header">
              <span>contrast information</span>
              <!-- <b class="border-bottom"></b> -->
            </div>
            <div class="color-info-container-list"></div>
          </section>
        </div>
        <div class="color-display-selector-container">
          <div class="color-display-selector">
            <div class="color-display-selector-description">
              <span>select color readout</span>
            </div>

            <button
              class="display-background-color"
              data-color="bg"
              title="click to switch the color readout to the background color."
            >
              <div>
                <span
                  >${this.activeColor === BACKGROUND
                    ? '> '
                    : ''}background</span
                >
              </div>
            </button>

            <button
              class="display-text-color"
              data-color="fg"
              title="click to switch the color readout to the foreground color."
            >
              <div>
                <span
                  >${this.activeColor === FOREGROUND
                    ? '> '
                    : ''}foreground</span
                >
              </div>
            </button>
          </div>

          <div class="color-display-selector">
            <div class="color-display-selector-description">
              <span>color config controls</span>
            </div>

            <button
              class="randomize-colors"
              title="click to change the foreground and background to random colors."
            >
              randomize colors
            </button>
            <button
              class="swap-colors"
              title="click to swap foreground color with background color."
            >
              swap colors
            </button>
            <div class="button-container">
              <button
                class="undo-color"
                title="click to undo a color operation."
              >
                undo
              </button>
              <button
                class="redo-color"
                title="click to redo a color operation."
              >
                redo
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    const displayBackgroundColor = this.qs('.display-background-color')
    const displayTextColor = this.qs('.display-text-color')

    const readoutButtons = [displayBackgroundColor, displayTextColor]

    readoutButtons.forEach((element, _idx, arr) => {
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

    const randomizeButton = this.qs('.randomize-colors')
    const swapButton = this.qs('.swap-colors')
    const undoButton = this.qs('.undo-color')
    const redoButton = this.qs('.redo-color')

    const undoColors = () => {
      const newColor = colorHistory.undo().current()
      minerva.set(COLORS, newColor)
      minerva.set(EXTERNAL_UPDATE, true)
    }

    const redoColors = () => {
      const newColor = colorHistory.redo().current()
      minerva.set(COLORS, newColor)
      minerva.set(EXTERNAL_UPDATE, true)
    }

    const randomizeColors = () => {
      const { fg: fgLocked, bg: bgLocked } = minerva.get(LOCKS)
      const { fg: currFg, bg: currBg } = minerva.get(COLORS)

      const newColors = {
        fg: fgLocked ? currFg : getRandomColor('hsl'),
        bg: bgLocked ? currBg : getRandomColor('hsl'),
      }

      minerva.set(COLORS, newColors)
      colorHistory.add(newColors).save(COLOR_HISTORY)
      minerva.set(EXTERNAL_UPDATE, true)
    }

    const swapColors = () => {
      const { fg, bg } = minerva.get(COLORS)

      const newColors = {
        bg: fg,
        fg: bg,
      }

      minerva.set(COLORS, newColors)
      colorHistory.add(newColors).save(COLOR_HISTORY)
      minerva.set(EXTERNAL_UPDATE, true)
    }

    randomizeButton.addEventListener('click', randomizeColors)
    swapButton.addEventListener('click', swapColors)
    redoButton.addEventListener('click', redoColors)
    undoButton.addEventListener('click', undoColors)

    minerva.on(ACTIVE_COLOR, color => {
      const { fg: hslFg, bg: hslBg } = minerva.get(COLORS)

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

    const colorsHandler = ({ fg, bg }) => {
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
      setCustomProperty(
        '--color-display-color-fade-12',
        stringifyHSL(fg, 0.125)
      )
      setCustomProperty('--color-display-color-fade-7', stringifyHSL(fg, 0.075))

      setCustomProperty('--bg-color', stringifyHSL(bg))
      setCustomProperty('--color-display-background', stringifyHSL(bg))
    }

    const updateAllColors = () => {
      const { fg, bg } = minerva.get(COLORS)
      colorsHandler({ fg, bg })
    }

    minerva.on(EXTERNAL_UPDATE, type => {
      console.log(type)
      if (type === 'import') updateAllColors()
    })

    minerva.on(COLORS, colorsHandler)

    this.setupWorkers()
  }
}

export default { name: ColorDisplay.name, element: ColorDisplay }
