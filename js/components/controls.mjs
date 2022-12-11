import Component from './component.mjs'
import { drag } from './icons/index.mjs'
import { html, LimitedList, debounce } from './../utils/index.mjs'
import {
  hslaToRGB,
  hslToHex,
  MODE_HEX,
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

class Controls extends Component {
  static name = 'onyx-controls'

  constructor() {
    super()

    this.id = Controls.name
    this.history = new LimitedList({ limit: minerva.get('historySize') })
    this.colors = minerva.get('colors')
    this.activeColor = 'fg'
    this.settings = {
      [MODE_RGB]: RGB_SETTINGS,
      [MODE_HSL]: HSL_SETTINGS,
      [MODE_HEX]: RGB_SETTINGS,
    }
    this.colorMode = this.settings[MODE_HSL]
    this.mode = minerva.get('colorMode') || MODE_HSL

    if (!minerva.get('colorMode')) minerva.set('colorMode', this.mode)
  }

  setControlMode(mode) {
    this.colorMode = this.settings[mode]
    this.mode = mode
    minerva.set('colorMode', mode)
  }

  updateHistory(colors) {
    this.history.add(colors)
  }

  getColors(mode) {
    const { bg, fg } = minerva.get('colors')

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
      case MODE_HEX:
        return {
          bg: hslToHex(bg),
          fg: hslToHex(fg),
        }
    }
  }

  setColorForLayer(layer, hsl) {
    minerva.set('colors', {
      bg: layer === 'bg' ? hsl : minerva.get('colors').bg,
      fg: layer === 'fg' ? hsl : minerva.get('colors').fg,
    })

    this.qs(`.${layer}-color-hex`).textContent = hslToHex(hsl)
  }

  getColorAndValue(index, colorValue) {
    const controlName = this.colorMode.names[index]
    return `${controlName} ${colorValue}`
  }

  // use layer param to decide wether to give this html
  // to the foreground or background sliders
  //
  // this also needs be run when switching modes
  renderSliders(layer) {
    if ([MODE_HSL, MODE_RGB, MODE_HEX].includes(this.mode)) {
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

  thinBorderButton(className, content) {
    return html`<button class=${className}>
      <div>${content}</div>
    </button>`
  }

  connectedCallback() {
    this.innerHTML = html`<section>
      <div class="controls-container">
        <div class="controls-container-sliders">
          <div class="controls-left">
            <div class="controls-header">
              ${this.thinBorderButton('lock-colors-fg', 'lock background')}
              ${this.thinBorderButton(
                'controls-add-to-palette',
                'add <span class="bg-color-hex">#000000</span> to palette'
              )}
              <div class="drag bg" title="drag this color">
                <div>${drag``}</div>
              </div>
            </div>
            <div class="controls-sliders background">
              ${this.renderSliders('bg')}
            </div>
          </div>

          <div class="controls-right">
            <div class="controls-header">
              ${this.thinBorderButton('lock-colors-fg', 'lock foreground')}
              ${this.thinBorderButton(
                'controls-add-to-palette',
                'add <span class="fg-color-hex">#000000</span> to palette'
              )}
              <div class="drag fg" title="drag this color">
                <div>${drag``}</div>
              </div>
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
  }
}

export default { name: Controls.name, element: Controls }
