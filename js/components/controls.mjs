import Component from './component.mjs'
import { html, LimitedList, debounce } from './../utils/index.mjs'
import {
  hslaToRGB,
  hslToHex,
  MODE_HSL,
  MODE_RGB,
} from './../utils/color/index.mjs'
import { minerva } from './../main.mjs'

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
const EXTERNALUPDATE = 'externalUpdate'

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

    minerva.on(EXTERNALUPDATE, () => {
      console.log('should update these sliders now...')
      this.connectedCallback()
    })
  }

  setControlMode(mode) {
    this.colorMode = this.settings[mode]
    this.mode = mode
    minerva.set(COLOR_MODE, mode)
  }

  updateHistory(colors) {
    this.history.add(colors)
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
                class="color-control"
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

  handlePaletteUpdate(color, layer) {
    const activePalette = minerva.get('activePalette')
    const palettes = minerva.get(PALETTES)
    const newColor = { color, layer }

    if (palettes.length === 0) return minerva.set(PALETTES, [[newColor]])

    palettes.at(activePalette || -1).push(newColor)

    minerva.set(PALETTES, palettes)
  }

  connectedCallback() {
    this.innerHTML = html`<section>
      <div class="controls-container">
        <div class="controls-container-sliders">
          <div class="controls-left">
            <div class="controls-header">
              <button class="lock-colors-bg">lock background</button>
              <button class="controls-add-to-palette-bg">
                <span>
                  add <span class="bg-color-hex">#000000</span> to palette
                </span>
              </button>

              <button
                class="derive-bg"
                title="derive palette from background"
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
              <button class="lock-colors-fg">lock foreground</button>
              <button class="controls-add-to-palette-fg">
                <span>
                  add <span class="fg-color-hex">#000000</span> to palette
                </span>
              </button>

              <button
                class="derive-fg"
                title="derive palette from foreground"
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

    const { fg, bg } = this.getColors(this.mode)
    this.qs('.fg-color-hex').textContent = hslToHex(fg)
    this.qs('.bg-color-hex').textContent = hslToHex(bg)
    const handleHistoryUpdate = debounce(
      () => this.updateHistory({ fg, bg }),
      200
    )

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

      this.handlePaletteUpdate(bg, 'bg')
    })

    this.foregroundAddToPaletteButton.addEventListener('click', () => {
      const { fg } = this.getColors(this.mode)

      this.handlePaletteUpdate(fg, 'fg')
    })

    console.log('controls re-rendered')
  }
}

export default { name: Controls.name, element: Controls }
