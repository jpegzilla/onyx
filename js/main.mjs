import {
  Arachne,
  colorSchemeToUse,
  Minerva,
  translationToUse,
  setCustomProperty,
  getCustomProperty,
} from './utils/index.mjs'
import components from './components/index.mjs'

export const minerva = new Minerva('jpegzilla-onyx')
export const arachne = Arachne

minerva.set('loaded', false)

const setupUserPrefs = minerva => {
  console.log({ colorSchemeToUse, translationToUse })

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
    minerva.set('colorScheme', colorSchemeToUse)
  }

  if (!minerva.get('language')) {
    minerva.set('language', translationToUse)
  }

  setCustomProperty('--hl-color-override', highlight)

  const colors = {
    fg: getCustomProperty('--text-color'),
    bg: getCustomProperty('--bg-color'),
  }

  minerva.set('colors', colors)
}

const allMounted = components.map(({ name }) =>
  customElements.whenDefined(name)
)
components.forEach(({ name, element }) => {
  if (name && element) customElements.define(name, element)
})

Promise.all(allMounted).then(() => {
  setupUserPrefs(minerva)
  minerva.set('loaded', true)
})
