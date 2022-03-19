// ♪音楽 → LANGE FEAT. SKYE - DRIFTING AWAY : https://www.youtube.com/watch?v=ktmcNflvDwk

import AudioManager from './../managers/audiomanager.mjs'
import arachne from './../arachne.mjs'

/**
 * Minerva - state manager!
 */
class Minerva {
  static _store = window.localStorage

  static defaultSettings = {
    volume: { effect: 100 },
    timeFormat: '24hr',
    systemColors: { highlight: 'e0005d' },
    machine: 'ONYX', // 4 character name of machine, customizable by user
    mute: false,
  }

  constructor(ident) {
    if (ident.replace(/\s/gi, '').trim() != ident) {
      arachne.error('invalid minerva key format')
    }

    this.events = {}
    this.temp = {}
    this.ident = ident
    this.store = this.load() || Minerva.defaultSettings
    this.hasAllSounds = false

    this.save()

    this.audioManager = new AudioManager({
      state: this,
    })
  }

  get audio() {
    return this.store.audio
  }

  get(key) {
    if (key === undefined) {
      arachne.error('Minerva.get must be called with a key.')
      return
    }

    const store = JSON.parse(Minerva._store.getItem(this.ident))

    return store[key] || this.store[key]
  }

  do(event, argument = '') {
    if (this.events[event]) this.events[event].forEach(fn => fn(argument))

    return this
  }

  play(sound) {
    this.store.audio &&
      this.audioManager.play(sound, {
        mute: this.get('mute'),
      })
  }

  set(key, item) {
    try {
      if (key === undefined || item === undefined) {
        arachne.error('Minerva.set must be called with both a key and a value.')
        return
      }

      this.store[key] = item

      this.save()

      if (this.events[key]) this.events[key].forEach(fn => fn(val))

      return this
    } catch (err) {
      arachne.error(
        `an error occurred while trying to update localStorage: ${err}`
      )
      return
    }
  }

  place(key, item) {
    this.temp[key] = item
  }

  on(ev, fn) {
    if (this.events[ev]) this.events[ev].push(fn)
    else this.events[ev] = [fn]
  }

  remove(key) {
    if (key === undefined) {
      arachne.error('Minerva.remove must be called with a key.')
      return
    }

    delete this.store[key]

    this.save()

    return this
  }

  save() {
    Minerva._store.setItem(this.ident, JSON.stringify(this.store))
  }

  clear() {
    Minerva._store.removeItem(this.ident)
  }

  load() {
    try {
      return JSON.parse(Minerva._store.getItem(this.ident))
    } catch {
      return null
    }
  }
}

export default Minerva
