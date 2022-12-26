import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { minerva } from './../main.mjs'
import { palette } from './subcomponents/index.mjs'

const PALETTES = 'palettes'

class Sidebar extends Component {
  static name = 'onyx-sidebar'

  constructor() {
    super()

    this.id = Sidebar.name
  }

  connectedCallback() {
    this.innerHTML = html`
      <section class="sidebar-container">
        <div class="palette-container"></div>
      </section>
    `

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
