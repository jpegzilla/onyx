import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { arachne, minerva } from './../main.mjs'

const sounds = ['click_small', 'click', 'failure', 'hover', 'success']

class LoadingScreen extends Component {
  constructor() {
    super()

    this.name = 'loadingscreen'
    this.id = 'loadingscreen'
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
      // look, maybe, just maybe I'll load some other assets here.
      // I swear it *needs* to be Promise.allSettled
      await Promise.allSettled([loadSounds])
    } catch (err) {
      arachne.error(err)

      return false
    }

    return true
  }

  allDone() {
    this.querySelector('.loading-screen-container').addEventListener(
      'animationend',
      e => {
        if (e.target !== e.currentTarget) return

        setTimeout(() => {
          this.remove()
        }, 500)
      }
    )

    this.addClass('fadeout')
  }

  connectedCallback() {
    this.innerHTML = html`<section class="loading-screen-container">
      <div class="loading-screen">
        <onyx-logo class="loading-screen-logo" />
      </div>
    </section>`

    this.loadAssets().then(val => {
      if (val) minerva.hasAllSounds = true
      else minerva.hasAllSounds = false

      this.allDone()
    })
  }
}

export default { name: 'loading-screen', element: LoadingScreen }
