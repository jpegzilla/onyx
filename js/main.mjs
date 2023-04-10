// ♪音楽 → MOJO-P - PINK MOON : https://www.youtube.com/watch?v=kMcTFR2hUGc
import {
  COLOR_HISTORY,
  LOADED,
  STATUS,
  HOTKEY_MODE,
  COLORS,
  ARRIVALS,
  LANGUAGE,
  COLOR_SCHEME,
  NEW_PLAYER,
} from './utils/state/minervaActions.mjs'
import {
  Arachne,
  colorSchemeToUse,
  Minerva,
  translationToUse,
  setCustomProperty,
  getCustomProperty,
  Mnemosyne,
  LimitedList,
  setupHotkeys,
  mobileCheck,
} from './utils/index.mjs'
import { hexToHSLA, stringifyHSL } from './utils/color/conversions.mjs'
import components from './components/index.mjs'

export * from './meta.mjs'
export const minerva = new Minerva('jpegzilla-onyx')
export const arachne = Arachne
export const mnemosyne = new Mnemosyne('jpegzilla-onyx')

const initialHistory = minerva.get(COLOR_HISTORY)
export const colorHistory = new LimitedList({
  limit: 1000,
  initializer: initialHistory,
})

minerva.set(LOADED, false)

const setupUserPrefs = minerva => {
  const { highlight } = minerva.get('systemColors')

  const setColorScheme = colorScheme => {
    document.documentElement.classList.add(colorScheme)
  }

  const setLanguage = language => {
    document.documentElement.setAttribute('lang', language)
  }

  setColorScheme(minerva.get(COLOR_SCHEME))
  setLanguage(minerva.get(LANGUAGE))

  minerva.set(ARRIVALS, minerva.get(ARRIVALS) + 1)

  minerva.on(LANGUAGE, setLanguage)
  minerva.on(COLOR_SCHEME, setColorScheme)

  if (minerva.get(ARRIVALS) > 0) {
    minerva.set(NEW_PLAYER, false)
  }

  if (!minerva.get(COLOR_SCHEME)) {
    minerva.set(COLOR_SCHEME, colorSchemeToUse())
  }

  if (!minerva.get(LANGUAGE)) {
    minerva.set(LANGUAGE, translationToUse)
  }

  setCustomProperty('--hl-color-override', highlight)

  const hasStoredColors = minerva.get(COLORS) && 'fg' in minerva.get(COLORS)

  const colors = hasStoredColors
    ? minerva.get(COLORS)
    : {
        fg: hexToHSLA(getCustomProperty('--text-color')),
        bg: hexToHSLA(getCustomProperty('--bg-color')),
      }

  minerva.set(COLORS, colors)

  setCustomProperty(
    '--color-display-color',
    stringifyHSL(minerva.get(COLORS).fg)
  )

  setCustomProperty(
    '--color-display-color-fade-12',
    stringifyHSL(minerva.get(COLORS).fg, 0.125)
  )

  setCustomProperty(
    '--color-display-color-fade-7',
    stringifyHSL(minerva.get(COLORS).fg, 0.075)
  )

  setCustomProperty(
    '--color-display-background',
    stringifyHSL(minerva.get(COLORS).bg)
  )
}

if (mobileCheck()) {
  document.querySelector('.no-mobile').style.display = 'flex'
} else {
  const allMounted = components.map(({ name }) =>
    customElements.whenDefined(name)
  )

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
    setupHotkeys(minerva)
    minerva.set(LOADED, true)
    minerva.set(STATUS, 'idle')
    minerva.set(HOTKEY_MODE, 'default')
  })
}

// window.addEventListener('storage', e => {
//   console.group()
//   arachne.warn('localStorage manually updated. new value:')
//   console.log(JSON.parse(e.newValue))
//   console.groupEnd()
// })
