import { html } from './../../utils/index.mjs'
import { stringifyHSL } from './../../utils/color/index.mjs'

export default (palette, index) => {
  const paletteColors = palette
    .map(({ color, layer }, colorIndex) => {
      const hslString = stringifyHSL(color)

      return html`
        <div
          class="onyx-palette-color"
          data-index=${colorIndex}
          data-layer=${layer}
          style="background-color: ${hslString}"
        ></div>
      `
    })
    .join('')

  return html`<div class="onyx-palette" data-index=${index}>
    <div class="palette-header">palette #${index + 1}</div>
    <div class="color-grid">${paletteColors}</div>
  </div>`
}
