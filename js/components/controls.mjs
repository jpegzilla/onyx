import Component from './component.mjs'
import { html, LimitedList, debounce, Palette } from './../utils/index.mjs'
import {
  hslaToRGB,
  hslToHex,
  MODE_HSL,
  MODE_RGB,
} from './../utils/color/index.mjs'
import { minerva, colorHistory } from './../main.mjs'

const RGB_SETTINGS = {
  names: ['red', 'green', 'blue'],
  ranges: [
    [0, 255],
    [0, 255],
    [0, 255],
  ],
}

const HSL_SETTINGS = {
  names: ['hue', 'saturation', 'lightness'],
  ranges: [
    [0, 360],
    [0, 100],
    [0, 100],
  ],
}

const PALETTES = 'palettes'
const COLOR_MODE = 'colorMode'
const COLORS = 'colors'
const EXTERNAL_UPDATE = 'externalUpdate'
const ACTIVE_PALETTE = 'activePalette'
const LOCKS = 'locks'
const COLOR_HISTORY = 'colorHistory'

class Controls extends Component {
  static name = 'onyx-controls'

  constructor() {
    super()

    this.id = Controls.name
    this.history = new LimitedList({ limit: minerva.get('historySize') })
    this.colors = minerva.get(COLORS)
    this.activeColor = 'fg'
    this.settings = {
      [MODE_RGB]: RGB_SETTINGS,
      [MODE_HSL]: HSL_SETTINGS,
    }
    this.colorMode = this.settings[MODE_HSL]
    this.mode = minerva.get(COLOR_MODE) || MODE_HSL

    if (!minerva.get(COLOR_MODE)) minerva.set(COLOR_MODE, this.mode)

    minerva.on(EXTERNAL_UPDATE, () => {
      this.connectedCallback()
    })
  }

  setControlMode(mode) {
    this.colorMode = this.settings[mode]
    this.mode = mode
    minerva.set(COLOR_MODE, mode)
  }

  updateHistory() {
    const colors = this.getColors(this.mode)
    colorHistory.add(colors).save(COLOR_HISTORY)
  }

  getColors(mode) {
    const { bg, fg } = minerva.get(COLORS)

    switch (mode) {
      case MODE_HSL:
        return {
          bg,
          fg,
        }
      case MODE_RGB:
        return {
          bg: hslaToRGB(...Object.values(bg)),
          fg: hslaToRGB(...Object.values(fg)),
        }
    }
  }

  setColorForLayer(layer, hsl) {
    minerva.set(COLORS, {
      bg: layer === 'bg' ? hsl : minerva.get(COLORS).bg,
      fg: layer === 'fg' ? hsl : minerva.get(COLORS).fg,
    })

    this.qs(`.${layer}-color-hex`).textContent = hslToHex(hsl)
  }

  getColorAndValue(index, colorValue) {
    const controlName = this.colorMode.names[index]
    const range = this.settings[this.mode].ranges[index]
    return `${controlName}: ${colorValue} out of ${range[1]}`
  }

  // use layer param to decide wether to give this html
  // to the foreground or background sliders
  //
  // this also needs be run when switching modes
  renderSliders(layer) {
    if ([MODE_HSL, MODE_RGB].includes(this.mode)) {
      return this.settings[this.mode].ranges
        .map((range, idx) => {
          const colorValueNumber = Object.values(
            this.getColors(this.mode)[layer]
          )
            [idx].toString()
            .replaceAll(/[^0-9\.]/gi, '')

          const colorAndValue = this.getColorAndValue(idx, colorValueNumber)

          return html`
            <div class="slider-container">
              <span class="color-value-${layer}-${idx}">${colorAndValue}</span>
              <input
                title="changes the ${this.settings[this.mode].names[
                  idx
                ]} of the ${layer === 'bg'
                  ? 'background'
                  : 'foreground'}. (shift+${layer[0]} shift+${idx + 1})"
                class="color-control ${layer}-${this.settings[this.mode].names[
                  idx
                ]}"
                type="range"
                min="${range[0]}"
                max="${range[1]}"
                step="0.1"
                value="${colorValueNumber}"
              />
            </div>
          `
        })
        .join('')
    }
  }

  handlePaletteUpdate(color, _layer) {
    const palettes = minerva.get(PALETTES)
    let palette
    const existingPalette = palettes?.[minerva.get(ACTIVE_PALETTE)]

    if (existingPalette)
      palette = new Palette({
        initializer: existingPalette,
        initialId: minerva.get(ACTIVE_PALETTE),
      })
    else palette = new Palette()

    minerva.set(ACTIVE_PALETTE, palette.id)

    palette.addColor(color)
  }

  connectedCallback() {
    const { fg: fgLocked, bg: bgLocked } = minerva.get(LOCKS)

    this.innerHTML = html`<section>
      <div class="controls-container">
        <div class="controls-container-sliders">
          <div class="controls-left">
            <div class="controls-header">
              <button
                class="lock-colors-bg"
                title="locks the background, preventing its randomization. (shift+b shift+x)"
              >
                ${bgLocked ? 'unlock background' : 'lock background'}
              </button>
              <button
                class="controls-add-to-palette-bg"
                title="adds the foreground color to the active palette. (shift+b shift+a)"
              >
                <span>
                  add <span class="bg-color-hex">#000000</span> to palette
                </span>
              </button>

              <button
                class="derive-bg"
                title="derives a new monochromatic palette from the background color."
                tabindex="0"
              >
                derive
              </button>
            </div>
            <div class="controls-sliders background">
              ${this.renderSliders('bg')}
            </div>
          </div>

          <div class="controls-right">
            <div class="controls-header">
              <button
                class="lock-colors-fg"
                title="locks the foreground, preventing its randomization. (shift+f shift+x)"
              >
                ${fgLocked ? 'unlock foreground' : 'lock foreground'}
              </button>
              <button
                class="controls-add-to-palette-fg"
                title="adds the foreground color to the active palette. (shift+f shift+a)"
              >
                <span>
                  add <span class="fg-color-hex">#000000</span> to palette
                </span>
              </button>

              <button
                class="derive-fg"
                title="derives a new monochromatic palette from the foreground color."
                tabindex="0"
              >
                derive
              </button>
            </div>
            <div class="controls-sliders foreground">
              ${this.renderSliders('fg')}
            </div>
          </div>
        </div>
      </div>
    </section>`

    this.backgroundColorInputs = this.qsa('.background .color-control')
    this.foregroundColorInputs = this.qsa('.foreground .color-control')
    this.backgroundAddToPaletteButton = this.qs('.controls-add-to-palette-bg')
    this.foregroundAddToPaletteButton = this.qs('.controls-add-to-palette-fg')

    const lockFgButton = this.qs('.lock-colors-fg')
    const lockBgButton = this.qs('.lock-colors-bg')

    lockBgButton.addEventListener('click', () => {
      const { fg: fgLock, bg: bgLock } = minerva.get(LOCKS)
      lockBgButton.textContent =
        !bgLock === true ? 'unlock background' : 'lock background'
      minerva.set(LOCKS, {
        fg: fgLock,
        bg: !bgLock,
      })
    })

    lockFgButton.addEventListener('click', () => {
      const { fg: fgLock, bg: bgLock } = minerva.get(LOCKS)
      lockFgButton.textContent =
        !fgLock === true ? 'unlock foreground' : 'lock foreground'
      minerva.set(LOCKS, {
        fg: !fgLock,
        bg: bgLock,
      })
    })

    const { fg, bg } = this.getColors(this.mode)
    this.qs('.fg-color-hex').textContent = hslToHex(fg)
    this.qs('.bg-color-hex').textContent = hslToHex(bg)
    const handleHistoryUpdate = debounce(() => this.updateHistory(), 200)

    const colorInputHandler = (e, layer, index) => {
      const newColor = Object.fromEntries(
        Object.entries(this.getColors(this.mode)[layer]).map(
          ([key, value], idx) =>
            idx === index ? [key, +e.target.value] : [key, value]
        )
      )

      this.qs(`.color-value-${layer}-${index}`).textContent =
        this.getColorAndValue(index, +e.target.value)

      this.setColorForLayer(layer, newColor)

      handleHistoryUpdate()
    }

    this.backgroundColorInputs.forEach((input, index) => {
      input.addEventListener('input', e => colorInputHandler(e, 'bg', index))
    })

    this.foregroundColorInputs.forEach((input, index) => {
      input.addEventListener('input', e => colorInputHandler(e, 'fg', index))
    })

    this.backgroundAddToPaletteButton.addEventListener('click', () => {
      const { bg } = this.getColors(this.mode)

      this.handlePaletteUpdate(bg)
    })

    this.foregroundAddToPaletteButton.addEventListener('click', () => {
      const { fg } = this.getColors(this.mode)

      this.handlePaletteUpdate(fg)
    })
  }
}

export default { name: Controls.name, element: Controls }
