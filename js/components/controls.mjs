import Component from './component.mjs'
import {
  html,
  LimitedList,
  throttle,
  setCustomProperty,
} from './../utils/index.mjs'
import { hslToRGB, hslToHex } from './../utils/color/conversions.mjs'
import { minerva } from './../main.mjs'

const MODE_RGB = 'rgb'
const RGB_SETTINGS = {
  name: MODE_RGB,
  names: ['red', 'green', 'blue'],
  ranges: [
    [0, 255],
    [0, 255],
    [0, 255],
  ],
}

const MODE_HSL = 'hsl'
const HSL_SETTINGS = {
  name: MODE_HSL,
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
    this.history = new LimitedList(minerva.get('historySize'))
    this.colors = minerva.get('colors')
    this.activeColor = 'fg'
    this.settings = {
      [MODE_RGB]: RGB_SETTINGS,
      [MODE_HSL]: HSL_SETTINGS,
    }
    this.controlMode = this.settings[MODE_HSL]
    this.mode = MODE_HSL
  }

  setControlMode(mode) {
    this.controlMode = this.settings[mode]
    this.mode = mode
  }

  updateHistory() {
    const update = throttle(() => {
      // this.history.add()
    }, 200)

    update()
  }

  getColors() {
    const { bg, fg } = minerva.get('colors')

    return {
      hex: {
        bg,
        fg,
      },
      [MODE_HSL]: {
        bg,
        fg,
      },
      [MODE_RGB]: {
        bg: hslToRGB(bg),
        fg: hslToRGB(fg),
      },
    }
  }

  setForeground() {}

  setBackground() {}

  getColorAndValue(layer, index) {
    const controlName = this.controlMode.names[index]

    const colorValue = Object.values(this.getColors()[this.mode][layer])[
      index
    ].toString()

    return `${controlName} ${colorValue}`
  }

  // use layer param to decide wether to give this html
  // to the foreground or background sliders
  renderSliders(layer) {
    if ([MODE_HSL, MODE_RGB].includes(this.mode)) {
      return this.settings[this.mode].ranges
        .map((range, idx) => {
          const colorValueNumber = Object.values(
            this.getColors()[this.mode][layer]
          )
            [idx].toString()
            .replaceAll(/[^0-9\.]/gi, '')

          const colorAndValue = this.getColorAndValue(layer, idx)

          return html`
            <div class="slider-container">
              <span class="color-value-${layer}-${idx}">${colorAndValue}</span>
              <input
                class="color-control"
                type="range"
                min="${range[0]}"
                max="${range[1]}"
                step="0.01"
                value="${colorValueNumber}"
              />
            </div>
          `
        })
        .join('')
    }
  }

  connectedCallback() {
    setCustomProperty(
      '--color-display-color',
      hslToHex(minerva.get('colors').fg)
    )
    setCustomProperty(
      '--color-display-background',
      hslToHex(minerva.get('colors').bg)
    )

    console.log(this.getColors())
    console.log(minerva)

    this.innerHTML = html`<section>
      <div class="controls-container">
        <div class="controls-container-buttons">
          <div>COCK</div>
        </div>
        <div class="controls-container-sliders">
          <div class="controls-left">
            <div class="controls-header">
              <button class="lock-colors-bg">🔒</button> background color
            </div>
            <div class="controls-sliders background">
              ${this.renderSliders('bg')}
            </div>
          </div>

          <div class="controls-right">
            <div class="controls-header">
              <button class="lock-colors-fg">🔒</button> text color
            </div>
            <div class="controls-sliders foreground">
              ${this.renderSliders('fg')}
            </div>
          </div>
        </div>
      </div>
    </section>`

    this.backgroundColorInputs = this.querySelectorAll(
      '.background .color-control'
    )
    this.foregroundColorInputs = this.querySelectorAll(
      '.foreground .color-control'
    )

    this.backgroundColorInputs.forEach((input, index) => {
      input.addEventListener('input', e => {
        console.log('background input', index, e.target.value)
      })
    })

    this.foregroundColorInputs.forEach((input, index) => {
      input.addEventListener('input', e => {
        console.log('foreground input', index, e.target.value)
      })
    })
  }
}

export default { name: Controls.name, element: Controls }
