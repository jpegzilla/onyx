import Component from './component.mjs'
// import { html } from "./../utils/index.mjs";
import { arachne, minerva } from './../main.mjs'

const sounds = ['click_small', 'click', 'failure', 'hover', 'success']

class LoadingScreen extends Component {
  constructor() {
    super()

    this.name = 'loadingscreen'
    this.id = 'loading-screen'
  }

  async loadAssets() {
    const loadSounds = new Promise((resolve, reject) => {
      minerva.audioManager
        .load(sounds, 'wav')
        .then(allSoundsLoaded => {
          if (!allSoundsLoaded) {
            arachne.warn('all sounds were not loaded. a file is missing.')
          } else {
            console.log('all sounds successfully loaded')
          }

          resolve(true)
        })
        .catch(err => {
          arachne.error(err)
          reject(err)
        })
    })

    try {
      await Promise.allSettled([loadSounds])
    } catch (err) {
      arachne.error(err)

      return false
    }

    return true
  }

  allDone() {
    console.log('remove loading screen now!')
  }

  connectedCallback() {
    this.loadAssets().then(val => {
      if (val) minerva.hasAllSounds = true
      else minerva.hasAllSounds = false

      this.allDone()
    })
  }
}

export default { name: 'loading-screen', element: LoadingScreen }
