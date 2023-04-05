import Component from './component.mjs'
import {
  html,
  objectComparison,
  setCustomProperty,
  supportsImportInWorkers,
  getUrlParams,
} from './../utils/index.mjs'
import {
  CONVERSIONS,
  OTHER_PALETTES,
  ACTIVE_COLOR,
  BACKGROUND,
  FOREGROUND,
  CONTRAST,
  EXTERNAL_UPDATE,
  COLORS,
  COLOR_HISTORY,
  LOCKS,
  COLOR_MODE,
} from './../utils/state/minervaActions.mjs'
import { minerva, colorHistory, arachne } from './../main.mjs'
import {
  hslToHex,
  stringifyHSL,
  hexToHSLA,
  hexToRGBA,
  MODE_HEX,
  MODE_HSL,
  MODE_RGB,
  getContrastRatio,
  getRandomColor,
  calculateAPCAContrast,
} from './../utils/color/index.mjs'
import { colorDisplayCopy } from './../data/copy.mjs'

import closestColorNonWorker from './../workers/closestColorFromPalette.nonWorker.mjs'
import conversionNonWorker from './../workers/colorConversion.nonWorker.mjs'
import { checkForEgg } from './../utils/managers/easterEggManager.mjs'

const conversionWorker = './js/workers/colorConversion.worker.mjs'
const closestColorWorker = './js/workers/closestColorFromPalette.worker.mjs'

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
      const padding = Math.abs(format.length - format.padEnd(10).length) + 1
      otherPalettesHTML += html`
        <div class="color-info-format-container">
          <span class="color-info-format">${format}</span
          ><span class="color-info-padding">${' '.repeat(padding)}</span
          ><span class="color-info-unit"
            >${name}${code ? ' [' + code + '] ' : ''}</span
          >
        </div>
      `
    })

    this.qs(
      '.color-info-container.palettes .color-info-container-list'
    ).innerHTML = otherPalettesHTML
  }

  handleConversionData({ data }) {
    if (this.isOldData(data, CONVERSIONS)) return

    minerva.place(CONVERSIONS, data)

    let conversionsHTML = ``

    data.entries.forEach(([format, value]) => {
      const padding = Math.abs(format.length - format.padEnd(10).length) + 1
      conversionsHTML += html`
        <div class="color-info-format-container">
          <span class="color-info-format">${format}</span
          ><span class="color-info-padding">${' '.repeat(padding)}</span
          ><span class="color-info-unit">${value}</span>
        </div>
      `
    })

    this.qs(
      '.color-info-container.conversions .color-info-container-list'
    ).innerHTML = conversionsHTML
  }

  handleContrastRatio(data) {
    const { number, string, wcag, luminance, perceptualContrast } = data

    if (this.isOldData(data, CONTRAST)) return

    minerva.place(CONTRAST, data)

    const dataToDisplay = {
      wcag2: wcag[0],
      ratio: number,
      'fg lum.': luminance.fg.toFixed(2),
      'bg lum.': luminance.bg.toFixed(2),
      'raw bg:fg': string,
      'apca Lc': perceptualContrast,
    }.entries

    let dataHTML = ``

    dataToDisplay.forEach(([format, value]) => {
      const padding = Math.abs(format.length - format.padEnd(10).length) + 1
      dataHTML += html`
        <div class="color-info-format-container">
          <span class="color-info-format">${format}</span
          ><span class="color-info-padding">${' '.repeat(padding)}</span
          ><span class="color-info-unit">${value}</span>
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
      '.color-display-readout .color-display-hex-code .color-display-input'
    )

    readout.classList.remove('pattern-mismatch')

    if (this.activeColor === BACKGROUND) {
      readout.value = bg
    }

    if (this.activeColor === FOREGROUND) {
      readout.value = fg
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
   * @param {Object} hexColors          hex colors, used for display
   * @param {String} hexColors.fg       foreground color (hex)
   * @param {String} hexColors.bg       background color (hex)
   * @param {Object} colorsToConvert    hsl colors, used for conversion
   * @param {Object} colorsToConvert.fg foreground color (hsl)
   * @param {Object} colorsToConvert.bg background color (hsl)
   */
  updateColors(hexColors, colorsToConvert) {
    const { fg, bg } = hexColors
    const format = minerva.get(COLOR_MODE)

    this.updateReadout({ fg, bg })

    // contrast ratio stuff really doesn't require
    // offloading to a worker
    const rgbFg = hexToRGBA(fg)
    const rgbBg = hexToRGBA(bg)
    const contrastRatio = getContrastRatio(colorsToConvert, format)
    const perceptualContrast = calculateAPCAContrast(rgbFg, rgbBg).toFixed(2)
    this.handleContrastRatio({ ...contrastRatio, perceptualContrast })

    try {
      const easterEgg = checkForEgg(colorsToConvert)?.name

      if (easterEgg) {
        minerva.set('headerEasterEgg', easterEgg)
      } else {
        minerva.set('headerEasterEgg', '')
      }
    } catch {
      arachne.warn('easter egg failed.')
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
              <span class="color-display-hex-code"><input class="color-display-input" type="text" value="#000000"  placeholder="#000000" pattern="#[a-fA-F0-9]{6}" maxlength="7" minlength="7">
            </div>
          </section>

          <section class="color-info-container conversions smaller-margin">
            <div class="color-info-container-header">
              <span>${colorDisplayCopy.conversionsHeader}</span>
              <!-- <b class="border-bottom"></b> -->
            </div>
            <div class="color-info-container-list"></div>
          </section>

          <section class="color-info-container palettes">
            <div class="color-info-container-header">
              <span>${colorDisplayCopy.analoguesHeader}</span>
              <!-- <b class="border-bottom"></b> -->
            </div>
            <div class="color-info-container-list"></div>
          </section>

          <section class="color-info-container contrast">
            <div class="color-info-container-header">
              <span>${colorDisplayCopy.contrastInformationHeader}</span>
              <!-- <b class="border-bottom"></b> -->
            </div>
            <div class="color-info-container-list"></div>
          </section>
        </div>
        <div class="color-display-selector-container">
          <div class="color-display-selector">
            <div class="color-display-selector-description">
              <span>${colorDisplayCopy.colorReadoutHeader}</span>
            </div>

            <button
              class="display-background-color"
              data-color="bg"
              title="${colorDisplayCopy.backgroundReadoutButton.title}"
            >
              <div>
                <span
                  >${this.activeColor === BACKGROUND ? '> ' : ''}${
      colorDisplayCopy.backgroundReadoutButton.text
    }</span
                >
              </div>
            </button>

            <button
              class="display-text-color"
              data-color="fg"
              title="${colorDisplayCopy.foregroundReadoutButton.title}"
            >
              <div>
                <span
                  >${this.activeColor === FOREGROUND ? '> ' : ''}${
      colorDisplayCopy.foregroundReadoutButton.text
    }</span
                >
              </div>
            </button>
          </div>

          <div class="color-display-selector">
            <div class="color-display-selector-description">
              <span>${colorDisplayCopy.colorConfigHeader}</span>
            </div>

            <button
              class="randomize-colors"
              title="${colorDisplayCopy.randomizeButton.title}"
            >
              ${colorDisplayCopy.randomizeButton.text}
            </button>
            <button
              class="swap-colors"
              title="${colorDisplayCopy.swapButton.title}"
            >
              ${colorDisplayCopy.swapButton.text}
            </button>
            <div class="button-container">
              <button
                class="undo-color"
                title="${colorDisplayCopy.undoButton.title}"
              >
                ${colorDisplayCopy.undoButton.text}
              </button>
              <button
                class="redo-color"
                title="${colorDisplayCopy.redoButton.title}"
              >
                ${colorDisplayCopy.redoButton.text}
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    const displayBackgroundColor = this.qs('.display-background-color')
    const displayTextColor = this.qs('.display-text-color')
    const colorInput = this.qs('.color-display-input')
    const randomizeButton = this.qs('.randomize-colors')
    const swapButton = this.qs('.swap-colors')
    const undoButton = this.qs('.undo-color')
    const redoButton = this.qs('.redo-color')

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

    /**
     * determines what happens when a color input is locked.
     * @param  {object}  locks
     * @param  {boolean} locks.fg true if the foreground is locked
     * @param  {boolean} locks.bg true if the background is locked
     */
    const handleColorInputLock = locks => {
      if (locks[minerva.get(ACTIVE_COLOR)]) {
        colorInput.disabled = true
        colorInput.title = 'editing locked.'
      } else {
        colorInput.disabled = false
        colorInput.title = ''
      }

      ;[swapButton, undoButton, redoButton, randomizeButton].forEach(e => {
        e.disabled = false
      })

      const prevColors = colorHistory.previous()
      const currentColors = colorHistory.current()
      const redoList = colorHistory.redoList

      swapButton.title = colorDisplayCopy.swapButton.title
      undoButton.title = colorDisplayCopy.undoButton.title
      redoButton.title = colorDisplayCopy.redoButton.title
      randomizeButton.title = colorDisplayCopy.redoButton.title

      if (!redoList.length) {
        redoButton.disabled = true
        redoButton.title = colorDisplayCopy.redoButton.disabledTitleAlternate
      }

      if (!prevColors) {
        undoButton.disabled = true
        undoButton.title = colorDisplayCopy.undoButton.disabledTitleAlternate2
      }

      if (
        prevColors &&
        ((locks.fg && !objectComparison(prevColors.fg, currentColors.fg)) ||
          (locks.bg && !objectComparison(prevColors.bg, currentColors.bg)))
      ) {
        undoButton.disabled = true
        undoButton.title = colorDisplayCopy.undoButton.disabledTitleAlternate
      }

      switch (locks.values.sum()) {
        // both colors locked: you cannot undo, redo, randomize or swap
        case 2:
          ;[swapButton, undoButton, redoButton, randomizeButton].forEach(e => {
            e.disabled = true
          })

          swapButton.title = colorDisplayCopy.swapButton.disabledTitle
          undoButton.title = colorDisplayCopy.undoButton.disabledTitle
          redoButton.title = colorDisplayCopy.redoButton.disabledTitle
          randomizeButton.title = colorDisplayCopy.redoButton.disabledTitle

        // only one color locked: you can still undo / redo / randomize
        // but you can't swap since one color can't be modified
        case 1:
          swapButton.disabled = true
          swapButton.title = colorDisplayCopy.swapButton.disabledTitle

        // nothing locked, all operations are enabled (do nothing)
        case 0:
        default:
          return
      }
    }

    minerva.on(LOCKS, handleColorInputLock)
    minerva.on([ACTIVE_COLOR, COLORS, EXTERNAL_UPDATE, COLOR_HISTORY], () =>
      handleColorInputLock(minerva.get(LOCKS))
    )

    handleColorInputLock(minerva.get(LOCKS))

    colorInput.addEventListener('input', e => {
      const { value } = e.target

      if (!/#[a-f0-9]{6}/i.test(value)) {
        e.target.classList.add('pattern-mismatch')
        return
      }

      e.target.classList.remove('pattern-mismatch')

      const activeColor = minerva.get(ACTIVE_COLOR)
      const locks = minerva.get(LOCKS)

      if (locks[activeColor]) return

      const inactiveColor = activeColor === 'bg' ? 'fg' : 'bg'
      const unchangedColor = minerva.get(COLORS)[inactiveColor]

      const newColors = {
        [activeColor]: hexToHSLA(value),
        [inactiveColor]: unchangedColor,
      }

      if (objectComparison(newColors, minerva.get(COLORS))) return

      minerva.set(COLORS, newColors)
      colorHistory.add(newColors).save(COLOR_HISTORY)
      minerva.set(EXTERNAL_UPDATE, true)
    })

    const undoColors = () => {
      const locks = minerva.get(LOCKS)
      const prevColors = colorHistory.previous()
      const currentColors = colorHistory.current()

      if (
        (locks.fg && !objectComparison(prevColors.fg, currentColors.fg)) ||
        (locks.bg && !objectComparison(prevColors.bg, currentColors.bg))
      )
        return

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
      const locks = minerva.get(LOCKS)
      const { fg: currFg, bg: currBg } = minerva.get(COLORS)

      if (locks.fg && locks.bg) return

      const newColors = {
        fg: locks.fg ? currFg : getRandomColor('hsl'),
        bg: locks.bg ? currBg : getRandomColor('hsl'),
      }

      minerva.set(COLORS, newColors)
      colorHistory.add(newColors).save(COLOR_HISTORY)
      minerva.set(EXTERNAL_UPDATE, true)
    }

    const swapColors = () => {
      const { fg, bg } = minerva.get(COLORS)
      const locks = minerva.get(LOCKS).values

      // there's no reason to do this, but since true + true = 2 in javscript
      // I can check if either lock is true by summing up the lock values lol
      if (locks.sum() > 0) return

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
      const mode = minerva.get(COLOR_MODE)
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
      if (type === 'import') updateAllColors()
    })

    minerva.on(COLORS, colorsHandler)

    this.setupWorkers()

    const urlParams = getUrlParams()

    if ('fg' in urlParams && 'bg' in urlParams) {
      const { fg, bg } = urlParams

      minerva.set(COLORS, {
        fg: hexToHSLA(`#${fg}`),
        bg: hexToHSLA(`#${bg}`),
      })
    }
  }
}

export default { name: ColorDisplay.name, element: ColorDisplay }
