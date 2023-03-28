import Component from './component.mjs'
import { html, Palette } from './../utils/index.mjs'
import { minerva } from './../main.mjs'
import { hslToHex } from './../utils/color/index.mjs'

import {
  ACTIVE_PALETTE,
  EXTERNAL_UPDATE,
  PALETTES,
} from './../utils/state/minervaActions.mjs'

const listeners = []

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

    return colors
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
      .join('')
  }

  renderPaletteHistory() {
    const palettes = structuredClone(minerva.get(PALETTES))
    delete palettes?.[minerva.get(ACTIVE_PALETTE)]

    if (!palettes.values.length)
      return html`<div class="empty-notifier">no palettes saved</div>`

    return palettes.entries
      .map(
        ([id, palette]) => html`<div class="saved-palette" data-ident="${id}">
          <div class="saved-palette-controls">
            <button class="saved-palette-activate" data-ident="${id}">
              set as active
            </button>
            <button class="saved-palette-export" data-ident="${id}">
              export
            </button>
            <button class="saved-palette-delete" data-ident="${id}">
              delete
            </button>
          </div>
          <div class="saved-palette-swatches">
            ${palette
              .map(
                ({ color }) =>
                  html`<div
                    class="swatch"
                    style="background-color:${hslToHex(color)}"
                  ></div>`
              )
              .join('')}
          </div>
        </div>`
      )
      .join('')
  }

  handleSavedPaletteActivate(ident) {
    if (!ident) return
    minerva.set(ACTIVE_PALETTE, ident)
  }

  handleSavedPaletteDelete(ident) {
    const palettes = structuredClone(minerva.get(PALETTES))
    delete palettes?.[ident]

    minerva.set(PALETTES, palettes)
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
    if (!minerva.get(PALETTES)?.[minerva.get(ACTIVE_PALETTE)]?.length) {
      return
    }

    const newActivePalette = new Palette()
    const newActivePaletteId = newActivePalette.id

    minerva.set(ACTIVE_PALETTE, newActivePaletteId)

    newActivePalette.updatePalettes()
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
          <div class="palettes">${this.renderPaletteHistory()}</div>
        </div>
      </div>
    `

    let primaryPaletteId = minerva.get(ACTIVE_PALETTE)
    let primaryPalette = minerva.get(PALETTES)?.[primaryPaletteId]
    const primaryPaletteContainer = this.qs(
      '.primary-palette-container .palette'
    )
    const paletteHistoryContainer = this.qs(
      '.palette-history-container .palettes'
    )

    const setSwatchListeners = () => {
      const shiftLeft = this.qsa('.shift-left')
      const shiftRight = this.qsa('.shift-right')
      const clearColor = this.qsa('.clear-color')
      const lockColor = this.qsa('.lock-color')

      shiftLeft.forEach(button => {
        listeners.forEach(e => button.removeEventListener('click', e))
        const listener = button.addEventListener('click', e =>
          this.handleColorSwap(+e.target.dataset.color, -1)
        )

        listeners.push(listener)
      })

      shiftRight.forEach(button => {
        listeners.forEach(e => button.removeEventListener('click', e))
        const listener = button.addEventListener('click', e =>
          this.handleColorSwap(+e.target.dataset.color, 1)
        )

        listeners.push(listener)
      })

      clearColor.forEach(button => {
        listeners.forEach(e => button.removeEventListener('click', e))
        const listener = button.addEventListener('click', e =>
          this.handlePaletteRemove(+e.target.dataset.color)
        )

        listeners.push(listener)
      })

      lockColor.forEach(button => {
        listeners.forEach(e => button.removeEventListener('click', e))
        const listener = button.addEventListener('click', e =>
          this.handlePaletteLock(+e.target.dataset.color)
        )

        listeners.push(listener)
      })
    }

    const setSavedPaletteListeners = () => {
      const activatePalette = this.qsa('.saved-palette-activate')
      const exportPalette = this.qsa('.saved-palette-export')
      const deletePalette = this.qsa('.saved-palette-delete')

      activatePalette.forEach(button => {
        listeners.forEach(e => button.removeEventListener('click', e))
        const listener = button.addEventListener('click', e => {
          console.log(e.target.dataset.ident)

          this.handleSavedPaletteActivate(e.target.dataset.ident)
        })

        listeners.push(listener)
      })

      exportPalette.forEach(button => {
        listeners.forEach(e => button.removeEventListener('click', e))
        const listener = button.addEventListener('click', e => {
          console.log(e.target.dataset.ident)
          // this.handleColorSwap(+e.target.dataset.color, 1)
        })

        listeners.push(listener)
      })

      deletePalette.forEach(button => {
        listeners.forEach(e => button.removeEventListener('click', e))
        const listener = button.addEventListener('click', e => {
          console.log(e.target.dataset.ident)
          this.handleSavedPaletteDelete(e.target.dataset.ident)
        })

        listeners.push(listener)
      })
    }

    const maybeUpdatePrimaryPalette = (palette, id) => {
      if (!palette) return

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

    const renderPaletteHistory = () => {
      paletteHistoryContainer.innerHTML = this.renderPaletteHistory()
      setSavedPaletteListeners()
    }

    const saveButton = this.qs('.save-palette')
    const generateButton = this.qs('.generate-palette')
    const exportButton = this.qs('.export-palette')

    saveButton.addEventListener('click', () => {
      this.handlePaletteSave()
    })

    generateButton.addEventListener('click', () => {
      // generate new palette, save the current one if it exists
      console.log('generating new palette')
    })

    exportButton.addEventListener('click', () => {
      console.log('opening export modal')
    })

    minerva.on(EXTERNAL_UPDATE, () => {
      const externalPrimaryPaletteId = minerva.get(ACTIVE_PALETTE)
      const externalPrimaryPalette =
        minerva.get(PALETTES)?.[externalPrimaryPaletteId]

      renderPaletteHistory()
      maybeUpdatePrimaryPalette(
        externalPrimaryPalette,
        externalPrimaryPaletteId
      )
    })

    minerva.on(ACTIVE_PALETTE, id => {
      primaryPaletteId = id
      primaryPalette = minerva.get(PALETTES)[id]

      renderPaletteHistory()
      maybeUpdatePrimaryPalette(primaryPalette, primaryPaletteId)
    })

    minerva.on(PALETTES, p => {
      primaryPaletteId = minerva.get(ACTIVE_PALETTE)
      primaryPalette = p?.[primaryPaletteId]

      renderPaletteHistory()
      maybeUpdatePrimaryPalette(primaryPalette, primaryPaletteId)
    })

    renderPaletteHistory()
    maybeUpdatePrimaryPalette(primaryPalette, primaryPaletteId)
  }
}

export default { name: Sidebar.name, element: Sidebar }
