import {
  Arachne,
  colorSchemeToUse,
  Minerva,
  translationToUse,
} from './utils/index.mjs'
import { LoadingScreen } from './components/index.mjs'

export const minerva = new Minerva('jpegzilla-onyx')
export const arachne = Arachne

const setupUserPrefs = (minerva, _arachne) => {
  console.log(
    { colorSchemeToUse, translationToUse },
    minerva.get('colorScheme'),
    minerva.get('language')
  )

  const { highlight } = minerva.get('systemColors')

  const setColorScheme = colorScheme => {
    document.documentElement.classList.add(colorScheme)
  }

  const setLanguage = language => {
    document.documentElement.setAttribute('lang', language)
  }

  setColorScheme(minerva.get('colorScheme'))
  setLanguage(minerva.get('language'))

  minerva.on('language', setColorScheme)
  minerva.on('colorScheme', setLanguage)

  if (!minerva.get('colorScheme')) {
    minerva.set('colorScheme', colorSchemeToUse)
  }

  if (!minerva.get('language')) {
    minerva.set('language', translationToUse)
  }

  document.documentElement.style.setProperty('--hl-color-override', highlight)
}

const elements = [LoadingScreen]

elements.forEach(({ name, element }) => {
  if (name && element) customElements.define(name, element)
})

setupUserPrefs(minerva)
