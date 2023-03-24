import Component from './component.mjs'
import { html, Palette } from './../utils/index.mjs'
import { minerva } from './../main.mjs'
import { hslToHex } from './../utils/color/index.mjs'

const PALETTES = 'palettes'
const FOREGROUND = 'fg'
const ACTIVE_COLOR = 'activeColor'
const ACTIVE_PALETTE = 'activePalette'
const EXTERNAL_UPDATE = 'externalUpdate'
const COLORS = 'colors'

class Sidebar extends Component {
  static name = 'onyx-sidebar'

  constructor() {
    super()

    this.id = Sidebar.name
  }

  renderPrimaryPalette(colors = []) {
    if (!colors.length) {
      return `<div class="empty-notifier">no active palette</div>`
    }

    return `
      ${colors
        .map(
          ({ color, locked }, idx) =>
            html`<div class="palette-swatch">
              <div
                class="palette-swatch-color"
                style="background-color:${color};"
              ></div>
              <div class="palette-swatch-controls">
                <button class="shift-left" data-color="${idx}">&lt;</button>

                <div class="center-button-container">
                  <button
                    data-color="${idx}"
                    class="lock-color"
                    title="click to lock this color in the palette."
                  >
                    ${locked ? 'locked' : 'lock'}
                  </button>

                  <button
                    data-color="${idx}"
                    title="click to clear this color from the palette."
                    class="clear-color"
                  >
                    clear
                  </button>
                </div>

                <button class="shift-right" data-color="${idx}">&gt;</button>
              </div>
            </div>`
        )
        .join('')}
    `
  }

  handleColorSwap(index, direction) {
    const palettes = minerva.get(PALETTES)
    let palette
    const existingPalette = palettes?.[minerva.get(ACTIVE_PALETTE)]

    if (existingPalette[index].locked) return

    if (existingPalette)
      palette = new Palette({
        initializer: existingPalette,
        initialId: minerva.get(ACTIVE_PALETTE),
      })
    else palette = new Palette()

    palette.move(index, direction)
  }

  handlePaletteRemove(index) {
    const palettes = minerva.get(PALETTES)
    let palette
    const existingPalette = palettes?.[minerva.get(ACTIVE_PALETTE)]

    if (existingPalette[index].locked) return

    if (existingPalette)
      palette = new Palette({
        initializer: existingPalette,
        initialId: minerva.get(ACTIVE_PALETTE),
      })
    else palette = new Palette()

    palette.removeColorAtIndex(index)

    minerva.set(ACTIVE_PALETTE, palette.id)
  }

  handlePaletteLock(index) {
    const palettes = minerva.get(PALETTES)
    let palette
    const existingPalette = palettes?.[minerva.get(ACTIVE_PALETTE)]

    if (existingPalette)
      palette = new Palette({
        initializer: existingPalette,
        initialId: minerva.get(ACTIVE_PALETTE),
      })
    else palette = new Palette()

    const isLocked = existingPalette[+index].locked

    if (isLocked) palette.unlock(+index)
    if (!isLocked) palette.lock(+index)

    minerva.set(ACTIVE_PALETTE, palette.id)
  }

  handlePaletteSave() {
    const allPalettes = minerva.get(PALETTES)
    const newActivePalette = new Palette()
    const newActivePaletteId = newActivePalette.id

    const newPalettes = {
      ...allPalettes,
      [newActivePaletteId]: newActivePalette,
    }

    minerva.set(ACTIVE_PALETTE, newActivePaletteId)
    minerva.set(PALETTES, newPalettes)
  }

  connectedCallback() {
    this.innerHTML = html`
      <div class="sidebar-container">
        <div class="primary-palette-container">
          <div class="controls">
            <button
              class="save-palette"
              title="save this palette to the library."
            >
              save
            </button>
            <button
              class="generate-palette"
              title="generate a new five-color palette. this will overwrite the current palette!"
            >
              generate
            </button>
            <button
              class="export-palette"
              title="export this palette for use in other contexts."
            >
              export
            </button>
          </div>
          <div class="palette">${this.renderPrimaryPalette()}</div>
        </div>
      </div>
      <div class="sidebar-container">
        <div class="palette-history-container">
          <div class="empty-notifier">no palettes saved</div>
        </div>
      </div>
    `

    let primaryPaletteId = minerva.get(ACTIVE_PALETTE)
    let primaryPalette = minerva.get(PALETTES)?.[primaryPaletteId]
    const primaryPaletteContainer = this.qs(
      '.primary-palette-container .palette'
    )

    const setSwatchListeners = () => {
      const shiftLeft = this.qsa('.shift-left')
      const shiftRight = this.qsa('.shift-right')
      const clearColor = this.qsa('.clear-color')
      const lockColor = this.qsa('.lock-color')

      shiftLeft.forEach(button => {
        button.addEventListener('click', e =>
          this.handleColorSwap(+e.target.dataset.color, -1)
        )
      })

      shiftRight.forEach(button => {
        button.addEventListener('click', e =>
          this.handleColorSwap(+e.target.dataset.color, 1)
        )
      })

      clearColor.forEach(button => {
        button.addEventListener('click', e =>
          this.handlePaletteRemove(+e.target.dataset.color)
        )
      })

      lockColor.forEach(button => {
        button.addEventListener('click', e =>
          this.handlePaletteLock(+e.target.dataset.color)
        )
      })
    }

    const maybeUpdatePrimaryPalette = (palette, id) => {
      if (!palette) {
        this.renderPrimaryPalette()

        return
      }

      primaryPalette = palette
      primaryPaletteId = id

      const colorsMappedToHex = palette.map(e => ({
        color: hslToHex(e.color),
        locked: e.locked,
      }))

      primaryPaletteContainer.innerHTML =
        this.renderPrimaryPalette(colorsMappedToHex)

      setSwatchListeners()
    }

    const saveButton = this.qs('.save-palette')
    const generateButton = this.qs('.generate-palette')
    const exportButton = this.qs('.export-palette')

    saveButton.addEventListener('click', () => {
      console.log('save palette')
    })

    generateButton.addEventListener('click', () => {
      console.log('generate palette')
    })

    exportButton.addEventListener('click', () => {
      console.log('export palette')
    })

    minerva.on(EXTERNAL_UPDATE, () => {
      const externalPrimaryPaletteId = minerva.get(ACTIVE_PALETTE)
      const externalPrimaryPalette =
        minerva.get(PALETTES)?.[externalPrimaryPaletteId]

      maybeUpdatePrimaryPalette(
        externalPrimaryPalette,
        externalPrimaryPaletteId
      )
    })

    minerva.on(ACTIVE_PALETTE, id => {
      primaryPaletteId = id
      primaryPalette = minerva.get(PALETTES)[id]

      maybeUpdatePrimaryPalette(primaryPalette, primaryPaletteId)
    })

    minerva.on(PALETTES, p => {
      primaryPaletteId = minerva.get(ACTIVE_PALETTE)
      primaryPalette = p?.[primaryPaletteId]
      maybeUpdatePrimaryPalette(primaryPalette, primaryPaletteId)
    })

    maybeUpdatePrimaryPalette(primaryPalette, primaryPaletteId)
  }
}

export default { name: Sidebar.name, element: Sidebar }
