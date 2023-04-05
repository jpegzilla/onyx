import Component from './component.mjs'
import { html, Palette, uuidv4, objectComparison } from './../utils/index.mjs'
import { minerva, colorHistory } from './../main.mjs'
import { hslToHex, hexToHSLA } from './../utils/color/index.mjs'
import { sidebarCopy } from './../data/copy.mjs'

import {
  ACTIVE_PALETTE,
  EXTERNAL_UPDATE,
  PALETTES,
  EXPORTING,
  SAVE_ACTIVE_PALETTE,
  ACTIVE_COLOR,
  LOCKS,
  COLORS,
  COLOR_HISTORY,
} from './../utils/state/minervaActions.mjs'

class Sidebar extends Component {
  static name = 'onyx-sidebar'

  constructor() {
    super()

    this.id = Sidebar.name
  }

  handleExportPalette(ident) {
    const palette = minerva.get(PALETTES)?.[ident]

    if (palette) {
      minerva.set(EXPORTING, { palette, ident })
    }
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
              data-color=${color}
              style="background-color:${color};${color.length !== 7
                ? 'border: 1px solid red;'
                : ''}"
            ></div>
            <div class="palette-swatch-controls">
              <button class="shift-left" data-color="${idx}">&lt;</button>

              <div class="center-button-container">
                <button
                  data-color="${idx}"
                  class="lock-color"
                  title="click to lock this color in the palette."
                >
                  ${locked
                    ? sidebarCopy.primaryPaletteLockButton.textAlternate
                    : sidebarCopy.primaryPaletteLockButton.text}
                </button>

                <button
                  data-color="${idx}"
                  title="click to clear this color from the palette."
                  class="clear-color"
                >
                  ${sidebarCopy.primaryPaletteClearButton.text}
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

    palettes.entries.forEach(([k, v]) => {
      if (v.length === 0) delete palettes[k]
    })

    return palettes.entries
      .reverse()
      .map(
        ([id, palette]) => html`<div class="saved-palette" data-ident="${id}">
          <div class="saved-palette-controls">
            <button class="saved-palette-activate" data-ident="${id}">
              set as active
            </button>
            <button class="saved-palette-duplicate" data-ident="${id}">
              duplicate
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
                    data-color="${hslToHex(color)}"
                    style="background-color:${hslToHex(color)};"
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

    // do not save palettes that are empty
    const filtered = minerva
      .get(PALETTES)
      .entries.filter(([k, v]) => v.length || k === ident)
    const newPaletteSet = Object.fromEntries(filtered)

    minerva.set(PALETTES, newPaletteSet)
  }

  handleSavedPaletteDelete(ident) {
    const palettes = structuredClone(minerva.get(PALETTES))
    delete palettes?.[ident]

    // minerva.set(PALETTES, palettes)
  }

  handleSavedPaletteDuplicate(ident) {
    const palettes = minerva.get(PALETTES)
    const dupe = palettes?.[ident]

    minerva.set(PALETTES, {
      ...palettes,
      [uuidv4()]: dupe,
    })
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

    if (palette.length !== 0) minerva.set(ACTIVE_PALETTE, palette.id)
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

  generateColorPalette() {
    this.handlePaletteSave()

    const randomPalette = Palette.generateRandom()

    const palette = new Palette()
    minerva.set(ACTIVE_PALETTE, palette.id)
    randomPalette.forEach(e => palette.addColor(e, 'onyx-palette-generated'))
  }

  connectedCallback() {
    this.innerHTML = html`
      <div class="sidebar-container">
        <div class="primary-palette-container">
          <div class="controls">
            <button
              class="save-palette"
              title="${sidebarCopy.primaryControlsSaveButton.title}"
            >
              ${sidebarCopy.primaryControlsSaveButton.text}
            </button>
            <button
              class="generate-palette"
              title="${sidebarCopy.primaryControlsGenerateButton.title}"
            >
              ${sidebarCopy.primaryControlsGenerateButton.text}
            </button>
            <button
              class="export-palette"
              title="${sidebarCopy.primaryControlsExportButton.title}"
            >
              ${sidebarCopy.primaryControlsExportButton.text}
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
      const swatch = this.qsa('.palette-swatch-color')

      swatch.forEach(s => {
        s.addEventListener('dblclick', e => {
          const color = e.target.dataset.color
          const activeColor = minerva.get(ACTIVE_COLOR)
          const locks = minerva.get(LOCKS)

          if (locks[activeColor]) return

          const inactiveColor = activeColor === 'bg' ? 'fg' : 'bg'
          const unchangedColor = minerva.get(COLORS)[inactiveColor]

          const newColors = {
            [activeColor]: hexToHSLA(color),
            [inactiveColor]: unchangedColor,
          }

          if (objectComparison(newColors, minerva.get(COLORS))) return

          minerva.set(COLORS, newColors)
          colorHistory.add(newColors).save(COLOR_HISTORY)
          minerva.set(EXTERNAL_UPDATE, true)
        })
      })

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

    const setSavedPaletteListeners = () => {
      const activatePalette = this.qsa('.saved-palette-activate')
      const exportPalette = this.qsa('.saved-palette-export')
      const deletePalette = this.qsa('.saved-palette-delete')
      const duplicatePalette = this.qsa('.saved-palette-duplicate')
      const swatch = this.qsa('.swatch')

      activatePalette.forEach(button => {
        button.addEventListener('click', e => {
          this.handleSavedPaletteActivate(e.target.dataset.ident)
        })
      })

      exportPalette.forEach(button => {
        button.addEventListener('click', e => {
          this.handleExportPalette(e.target.dataset.ident)
        })
      })

      deletePalette.forEach(button => {
        button.addEventListener('click', e => {
          this.handleSavedPaletteDelete(e.target.dataset.ident)
        })
      })

      duplicatePalette.forEach(button => {
        button.addEventListener('click', e => {
          this.handleSavedPaletteDuplicate(e.target.dataset.ident)
        })
      })

      swatch.forEach(s => {
        s.addEventListener('dblclick', e => {
          const color = e.target.dataset.color
          const activeColor = minerva.get(ACTIVE_COLOR)
          const locks = minerva.get(LOCKS)

          if (locks[activeColor]) return

          const inactiveColor = activeColor === 'bg' ? 'fg' : 'bg'
          const unchangedColor = minerva.get(COLORS)[inactiveColor]

          const newColors = {
            [activeColor]: hexToHSLA(color),
            [inactiveColor]: unchangedColor,
          }

          if (objectComparison(newColors, minerva.get(COLORS))) return

          minerva.set(COLORS, newColors)
          colorHistory.add(newColors).save(COLOR_HISTORY)
          minerva.set(EXTERNAL_UPDATE, true)
        })
      })
    }

    const maybeUpdatePrimaryPalette = (palette, id) => {
      if (!palette) {
        primaryPaletteContainer.innerHTML = this.renderPrimaryPalette()

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
      this.generateColorPalette()
    })

    exportButton.addEventListener('click', () => {
      this.handleExportPalette(minerva.get(ACTIVE_PALETTE))
    })

    minerva.on(SAVE_ACTIVE_PALETTE, () => this.handlePaletteSave())

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
