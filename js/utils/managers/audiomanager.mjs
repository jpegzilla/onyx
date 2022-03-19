import { uuidv4 } from '../index.mjs'
import { arachne } from './../../main.mjs'

const BASE_PATH = './../../assets/audio/'

export default class AudioManager {
  ctx = new AudioContext()

  constructor(options) {
    // contains sounds loaded via the load function
    this.sounds = {}

    // contains the current playing sounds
    this.sources = []

    this.state = options.state

    return this
  }

  /**
   * play - play a sound from the instance's currently loaded files.
   *
   * @param {string}   name       name of loaded sound to play.
   * sound names are from the array of loaded sounds in this.sounds
   * @param {object} [options = {}] options for playing the sound,
   * such as delay, panning, distortion, and other effects.
   *
   * @returns {undefined} void
   */
  play(name, { mute }) {
    if (mute) return
    if (Object.keys(this.sounds).length === 0) {
      arachne.warn('tried to play a sound without loading it.')
    }

    const id = uuidv4()

    const source = this.ctx.createBufferSource()
    const gainNode = this.ctx.createGain()
    source.connect(gainNode)
    gainNode.connect(this.ctx.destination)

    // add the new audio to the sources, and set it's state to running.
    this.sources.push({ name, id, source, state: 'running' })
    source.buffer = this.sounds[name]
    source.connect(this.ctx.destination)

    // this is meant to prevent sounds from overlapping.
    // if there is a sound source with the same name as
    // a source that is still playing, the new sound
    // does not play.
    if (this.sources.find(item => item.name === name)) {
      if (this.sources.every(item => item.name === name).state === 'running') {
        console.log('sound rejected.', name)
        return
      }
    }

    gainNode.gain.setValueAtTime(1, this.ctx.currentTime)

    if (gainNode.gain.value > 0) source.start()

    // whenever a sound stops, it's state is set to stopped, and it is removed
    // from the array of sources. this is to help when detecting sounds that might
    // be inappropriately running at the same time and overlapping.
    source.addEventListener('ended', () => {
      this.sources = this.sources.map(i => {
        if (i.id === id) {
          return {
            ...i,
            state: 'stopped',
          }
        } else return i
      })

      this.sources.unshift()
      // console.log("sources", this.sources);
    })
  }

  // close the audio manager's audiocontext.
  close() {
    this.ctx.close()
  }

  // this could be used to refresh and reload the sound in the audiomanager's cache,
  // if that were for some reason needed.
  unload() {
    this.sources = {}
  }

  /**
   * load - load an array of audio objects that the audiomanager
   * will need to play.
   *
   * @param {array} paths array of objects representing audio to load.
   * objects must take the format `{ file: sound, name: "sound" }`, where
   * `sound` is a reference to an imported sound file. the name can be whatever
   * you'd like.
   *
   * @returns {Promise} promise that resolves when all audio loads.
   */
  async load(names, format) {
    const promises = names.map(
      name =>
        new Promise((resolve, reject) => {
          const resolvedPath = `${BASE_PATH}${name}.${format}`
          fetch(resolvedPath)
            .then(res => res.arrayBuffer())
            .then(buf =>
              this.ctx
                .decodeAudioData(buf)
                .then(sound => {
                  this.sounds[name] = sound
                  resolve(true)
                })
                .catch(err => {
                  arachne.error(`${err} (${name})`)
                  reject(err)
                })
            )
            .catch(err => {
              arachne.error(err)
              reject(err)
            })
        })
    )

    const allSettled = await Promise.allSettled(promises).then(values => {
      const filteredValues = values.filter(
        ({ status }) => status !== 'rejected'
      )

      return filteredValues
    })

    if (allSettled.length === names.length) return true
    else return false
  }
}
