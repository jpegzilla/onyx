// ♪音楽 → IROHA(SASAKI) - 炉心融解 : https://www.youtube.com/watch?v=jrldXNpoaac

import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { arachne, minerva } from './../main.mjs'

const sounds = ['click_small', 'click', 'failure', 'hover', 'success']

class LoadingScreen extends Component {
  static name = 'onyx-loading-screen'

  constructor() {
    super()

    this.id = this.name
  }

  async loadAssets() {
    const loadSounds = new Promise((resolve, reject) => {
      minerva.audioManager
        .load(sounds, 'wav')
        .then(allSoundsLoaded => {
          if (!allSoundsLoaded) {
            arachne.warn('all sounds were not loaded. a file is missing.')
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

  waitForAllComponents() {
    return new Promise(resolve =>
      minerva.on('loaded', loaded => loaded && resolve())
    )
  }

  async waitForEverything() {
    await this.waitForAllComponents()

    const assetsLoadedCorrectly = await this.loadAssets()

    if (assetsLoadedCorrectly) {
      minerva.hasAllSounds = true
      console.log('everything loaded correctly.')
    } else minerva.hasAllSounds = false

    return true
  }

  connectedCallback() {
    this.innerHTML = html`<section class="loading-screen-container">
      <b class="filters noise"></b>
      <div class="loading-screen">
        <onyx-logo class="loading-screen-logo" style="display: none;" />
      </div>
    </section>`

    this.waitForEverything().then(() => {
      this.allDone()
    })

    this.querySelector('.loading-screen-logo').setAttribute('style', '')
  }
}

export default { name: LoadingScreen.name, element: LoadingScreen }
