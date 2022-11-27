// ♪音楽 → MOJO-P - PINK MOON : https://www.youtube.com/watch?v=kMcTFR2hUGc
import {
  Arachne,
  colorSchemeToUse,
  Minerva,
  translationToUse,
  setCustomProperty,
  getCustomProperty,
  Mnemosyne,
  supportsImportInWorkers,
} from './utils/index.mjs'
import { hexToHSLA, stringifyHSL } from './utils/color/conversions.mjs'
import components from './components/index.mjs'

export * from './meta.mjs'
export const minerva = new Minerva('jpegzilla-onyx')
export const arachne = Arachne
export const mnemosyne = new Mnemosyne('jpegzilla-onyx')

minerva.set('loaded', false)

const setupUserPrefs = minerva => {
  const { highlight } = minerva.get('systemColors')

  const setColorScheme = colorScheme => {
    document.documentElement.classList.add(colorScheme)
  }

  const setLanguage = language => {
    document.documentElement.setAttribute('lang', language)
  }

  setColorScheme(minerva.get('colorScheme'))
  setLanguage(minerva.get('language'))

  minerva.set('arrivals', minerva.get('arrivals') + 1)

  minerva.on('language', setLanguage)
  minerva.on('colorScheme', setColorScheme)

  if (minerva.get('arrivals') > 0) {
    minerva.set('newPlayer', false)
  }

  if (!minerva.get('colorScheme')) {
    minerva.set('colorScheme', colorSchemeToUse())
  }

  if (!minerva.get('language')) {
    minerva.set('language', translationToUse)
  }

  setCustomProperty('--hl-color-override', highlight)

  const hasStoredColors = minerva.get('colors') && 'fg' in minerva.get('colors')

  const colors = hasStoredColors
    ? minerva.get('colors')
    : {
        fg: hexToHSLA(getCustomProperty('--text-color')),
        bg: hexToHSLA(getCustomProperty('--bg-color')),
      }

  minerva.set('colors', colors)

  setCustomProperty(
    '--color-display-color',
    stringifyHSL(minerva.get('colors').fg)
  )
  setCustomProperty(
    '--color-display-background',
    stringifyHSL(minerva.get('colors').bg)
  )
}

const allMounted = components
  .map(({ name }) => customElements.whenDefined(name))
  .concat(supportsImportInWorkers(minerva))
components.forEach(({ name, element }) => {
  if (customElements.get(name)) {
    arachne.warn(
      'received a custom element that has already been defined. check component exports!'
    )

    return
  }

  if (name && element) customElements.define(name, element)
})

Promise.all(allMounted).then(() => {
  setupUserPrefs(minerva)
  minerva.set('loaded', true)
})

window.addEventListener('storage', e => {
  console.group()
  arachne.warn('localStorage manually updated. new value:')
  console.log(JSON.parse(e.newValue))
  console.groupEnd()
})
