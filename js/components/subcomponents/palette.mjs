import { html } from './../../utils/index.mjs'
import { stringifyHSL } from './../../utils/color/index.mjs'

export default (palette, index) => {
  const paletteColors = palette
    .map(({ color, layer }) => {
      const hslString = stringifyHSL(color)

      return html`
        <div
          class="onyx-palette-color"
          data-index=${index}
          data-layer=${layer}
          style="background-color: ${hslString}"
        ></div>
      `
    })
    .join('')

  return html`<div class="onyx-palette">
    <div class="palette-header">palette #${index + 1}</div>
    <div class="color-grid">${paletteColors}</div>
  </div>`
}
