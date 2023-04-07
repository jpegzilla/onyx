import Component from './component.mjs'
import {
  html,
  objectComparison,
  downloadHexadecimalData,
  downloadImageData,
  downloadTextData,
} from './../utils/index.mjs'
import {
  hslToHex,
  generatePalPalette,
  generateHexPalette,
  generateGimpPalette,
  generateSassPalette,
  generateCSSPalette,
  generatePaintPalette,
  generateASEPalette,
  generateImagePalette,
} from './../utils/color/index.mjs'
import { minerva } from './../main.mjs'

import {
  EXPORTING,
  COLORS,
  PALETTES,
} from './../utils/state/minervaActions.mjs'

const listeners = []

const currentUrl = `${window.location.protocol}//${window.location.host}`

class PaletteModal extends Component {
  static name = 'onyx-palette-modal'

  constructor() {
    super()

    this.id = PaletteModal.name
    this.cache = {}
  }

  renderNonImageMaterials(materialNames, contentList, linkObjects) {
    return materialNames
      .map((e, i) => {
        const { href, download } = linkObjects[i]
        return html`
          <div class="material material-${e}">
            <code class="material-actual">${contentList[i]}</code>
            <div class="material-url download">
              <a rel="noopener noreferrer" href="${href}" download="${download}"
                >download ${download}</a
              >
            </div>
          </div>
        `
      })
      .join('')
  }

  regenerateDownloadLinks(ident) {
    const name = minerva.get(PALETTES)[ident][0].name

    this.qsa('.material-url.download a').forEach(e => {
      const extension = e.download.split('.')[1]

      e.download = `${name}.${extension}`
      e.textContent = `download ${name}.${extension}`
    })
  }

  renderPaletteExportMenu(palette, container, ident) {
    const { fg, bg } = minerva.get(COLORS)
    const paletteName = minerva.get(PALETTES)?.[ident][0].name || 'onyx-palette'
    const colorCombinationUrl = new URL(currentUrl)
    let useCachedPalettes = false

    colorCombinationUrl.searchParams.append('fg', hslToHex(fg).replace('#', ''))
    colorCombinationUrl.searchParams.append('bg', hslToHex(bg).replace('#', ''))

    if (objectComparison(palette, this.cache?.palette || {})) {
      useCachedPalettes = true
    }

    this.cache.palette = palette

    const sassPalette = useCachedPalettes
      ? this.cache.sass
      : generateSassPalette(palette)
    const hexPalette = useCachedPalettes
      ? this.cache.hex
      : generateHexPalette(palette)
    const palPalette = useCachedPalettes
      ? this.cache.pal
      : generatePalPalette(palette)
    const gimpPalette = useCachedPalettes
      ? this.cache.gimp
      : generateGimpPalette(palette)
    const cssPalette = useCachedPalettes
      ? this.cache.css
      : generateCSSPalette(palette)
    const paintPalette = useCachedPalettes
      ? this.cache.paint
      : generatePaintPalette(palette)
    const asePalette = useCachedPalettes
      ? this.cache.ase
      : generateASEPalette(palette)

    const aseLinkObject = downloadHexadecimalData(
      asePalette,
      paletteName,
      'ase'
    )
    const hexLinkObject = downloadHexadecimalData(
      hexPalette,
      paletteName,
      'hex'
    )
    const sassLinkObject = downloadTextData(sassPalette, paletteName, 'sass')
    const cssLinkObject = downloadTextData(cssPalette, paletteName, 'css')
    const gimpLinkObject = downloadTextData(gimpPalette, paletteName, 'gpl')
    const paintLinkObject = downloadTextData(paintPalette, paletteName, 'txt')
    const palLinkObject = downloadTextData(palPalette, paletteName, 'pal')

    if (!useCachedPalettes) {
      this.cache.sass = sassPalette
      this.cache.hex = hexPalette
      this.cache.pal = palPalette
      this.cache.gimp = gimpPalette
      this.cache.css = cssPalette
      this.cache.paint = paintPalette
      this.cache.ase = asePalette
    }

    container.innerHTML = html`<div class="palette-export-menu">
      <div class="palette-export-menu-controls">
        <button class="material-switch active" data-type="png">.png ></button>
        <button class="material-switch" data-type="sass">.sass</button>
        <button class="material-switch" data-type="css">.css</button>
        <button class="material-switch" data-type="ase">.ase</button>
        <button class="material-switch" data-type="hex">.hex</button>
        <button class="material-switch" data-type="pal">.pal</button>
        <button class="material-switch" data-type="gpl">.gpl</button>
        <button class="material-switch" data-type="paintnet">.txt</button>
      </div>

      <div class="palette-export-menu-material">
        <div class="material-name">
          <input
            class="material-name-input"
            type="text"
            placeholder="onyx palette filename"
            value="${paletteName}"
            spellcheck="false"
          />
        </div>

        <div class="material-display">
          <div class="material material-png active">
            <div class="material-actual">
              <b class="red-hat-loader">e</b>
              <b class="montserrat-loader">e</b>
              <canvas class="image-canvas"></canvas>
            </div>
            <div class="material-url download">
              <a rel="noopener noreferrer">loading...</a>
            </div>
          </div>

          ${this.renderNonImageMaterials(
            ['sass', 'css', 'ase', 'hex', 'pal', 'gpl', 'paintnet'],
            [
              sassPalette,
              cssPalette,
              asePalette,
              hexPalette,
              palPalette,
              gimpPalette,
              paintPalette,
            ],
            [
              sassLinkObject,
              cssLinkObject,
              aseLinkObject,
              hexLinkObject,
              palLinkObject,
              gimpLinkObject,
              paintLinkObject,
            ]
          )}
        </div>

        <div class="material-url">
          here's a link to the current color combination:
          <span class="material-url-value"
            ><a
              rel="noopener noreferrer"
              href="${colorCombinationUrl.href}"
              target="_blank"
              >${colorCombinationUrl.href}</a
            >
          </span>
        </div>
      </div>
    </div>`

    const canvas = this.qs('.image-canvas')
    const canvasDownloadLink = this.qs('.material-png a')

    generateImagePalette(palette, canvas).then(c => {
      const { href: imageHref, download: imageDownload } = downloadImageData(
        c,
        paletteName
      )

      canvasDownloadLink.href = imageHref
      canvasDownloadLink.textContent = `download ${imageDownload}`
      canvasDownloadLink.download = imageDownload
    })

    const nameInput = this.qs('.material-name-input')

    nameInput.addEventListener('input', e => {
      const { value } = e.target

      if (value.length) {
        const palettes = minerva.get(PALETTES)
        const paletteToUpdate = palettes[ident].map(e => ({
          ...e,
          name: value,
        }))

        minerva.set(PALETTES, {
          ...palettes,
          [ident]: paletteToUpdate,
        })

        this.regenerateDownloadLinks(ident)
      }
    })
  }

  setupPaletteExportControls() {
    const buttons = this.qsa('.material-switch')

    buttons.forEach((e, idx) => {
      e.removeEventListener('click', listeners[idx])

      const listener = e.addEventListener('click', e => {
        this.qsa('.material').forEach(e => e.classList.remove('active'))
        this.qsa('.material-switch').forEach(
          el => (el.textContent = el.textContent.replace(' >', ''))
        )

        const materialToActivate = e.target.dataset.type
        const materialMenu = this.qs(`.material-${materialToActivate}`)
        materialMenu.classList.add('active')
        e.target.textContent = `${e.target.textContent} >`
      })

      listeners.push(listener)
    })
  }

  connectedCallback() {
    this.innerHTML = html`<section class="palette-modal-container"></section>`

    const modalContainer = this.qs('.palette-modal-container')

    minerva.on(EXPORTING, ({ palette, ident }) => {
      this.renderPaletteExportMenu(palette, modalContainer, ident)
      this.setupPaletteExportControls()
      modalContainer.classList.add('palette-open')
      modalContainer.querySelector('button').focus()
    })

    modalContainer.addEventListener('click', e => {
      const { target } = e

      if (target === modalContainer) {
        modalContainer.classList.remove('palette-open')
      }
    })
  }
}

export default { name: PaletteModal.name, element: PaletteModal }
