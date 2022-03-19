import {
  Arachne,
  colorSchemeToUse,
  Minerva,
  translationToUse,
} from './utils/index.mjs'
import { LoadingScreen } from './components/index.mjs'

console.log('hello from the main file!')

export const minerva = new Minerva('jpegzilla-onyx')
export const arachne = Arachne

console.log({ colorSchemeToUse, translationToUse })

const elements = [LoadingScreen]

elements.forEach(({ name, element }) => {
  if (name && element) customElements.define(name, element)
})
