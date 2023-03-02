import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import {
  hslToHex,
  getSplitComplementaryColors,
  getAnalogousColors,
  getComplementaryColors,
} from './../utils/color/index.mjs'
import { minerva } from './../main.mjs'
import { palette } from './subcomponents/index.mjs'

const PALETTES = 'palettes'
const FOREGROUND = 'fg'
const ACTIVE_COLOR = 'activeColor'
const EXTERNAL_UPDATE = 'externalUpdate'
const COLORS = 'colors'

class Sidebar extends Component {
  static name = 'onyx-sidebar'

  constructor() {
    super()

    this.id = Sidebar.name
  }

  connectedCallback() {
    this.innerHTML = html`
      <div class="sidebar-container">
        <div class="harmony-container">
          ${[
            ['analogous', 3],
            ['split complementary', 3],
            ['complementary', 2],
          ]
            .map(
              ([name, amount]) => html`<div class="sidebar-harmony">
                <div class="sidebar-harmony-description">
                  <span>${name} harmony</span>
                </div>

                <div class="color-harmony-preview ${name.replaceAll(' ', '')}">
                  ${[...new Array(amount)]
                    .map(() => html`<b><span></span></b>`)
                    .join('')}
                </div>
              </div> `
            )
            .join('\n')}
        </div>
      </div>
      <div class="sidebar-container">
        <div class="palette-container"></div>
      </div>
    `

    const setColorHarmonies = () => {
      const { fg, bg } = minerva.get('colors')
      const analogousColors = getAnalogousColors(
        this.activeColor === FOREGROUND ? hslToHex(fg) : hslToHex(bg)
      )

      const complementaryColors = getComplementaryColors(
        this.activeColor === FOREGROUND ? hslToHex(fg) : hslToHex(bg)
      )

      const splitComplementaryColors = getSplitComplementaryColors(
        this.activeColor === FOREGROUND ? hslToHex(fg) : hslToHex(bg)
      )

      const colorList = [
        analogousColors,
        complementaryColors,
        splitComplementaryColors,
      ]

      ;['analogous', 'complementary', 'splitcomplementary'].forEach((e, i) => {
        Array.from(this.qsa(`.color-harmony-preview.${e} b`)).forEach(
          (e, j) =>
            (e.style.backgroundColor = e.querySelector('span').textContent =
              colorList[i][j])
        )
      })
    }

    this.activeColor = minerva.get(ACTIVE_COLOR)

    setColorHarmonies()

    minerva.on(ACTIVE_COLOR, () => {
      this.activeColor = activeColor
      setColorHarmonies()
    })
    minerva.on(COLORS, setColorHarmonies)
    minerva.on(EXTERNAL_UPDATE, setColorHarmonies)

    const paletteContainer = this.qs('.palette-container')
    // minerva.set(PALETTES, [])
    const existingPalettes = minerva.get(PALETTES)

    if (existingPalettes)
      paletteContainer.innerHTML = existingPalettes.map((p, i) => palette(p, i))

    minerva.on(PALETTES, paletteData => {
      console.log('in sidebar, palette update recieved', paletteData)

      const paletteDatad = paletteData.map((paletteObject, index) => {
        console.log(palette(paletteObject, index))
        return palette(paletteObject, index)
      })

      paletteContainer.innerHTML = paletteDatad.join('')
    })
  }
}

export default { name: Sidebar.name, element: Sidebar }
