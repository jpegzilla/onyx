// ♪音楽 → LANGE FEAT. SKYE - DRIFTING AWAY : https://www.youtube.com/watch?v=ktmcNflvDwk

import AudioManager from './../managers/audioManager.mjs'
import arachne from './../arachne.mjs'

const PROCESS_TYPE = 'processType'
const MACHINE = 'machine'
const MUTE = 'mute'

/**
 * Minerva - state manager!
 */
class Minerva {
  static _store = window.localStorage

  /**
   * default settings for minerva
   *
   * @type {object}
   * @property {object} volume settings for application volume
   * @property {string} timeFormat time format to display, 12 or 24hr
   * @property {object} systemColors colors to use for highlights
   * @property {object} colors ??? what was this for again?
   * @property {object} palettes list of palette objects ([id]: colors)
   * @property {string} machine name of instance (for data export)
   * @property {boolean} mute true if sound should be muted
   * @property {boolean} newPlayer true if onyx hasn't been used
   * @property {number} arrivals 0 if onyx has been used before
   * @property {string} processType ??? don't remember what this was
   * @property {number} historySize amount of previous color storage
   * @property {string} activeColor current color being displayed
   * @property {object} workspaces user's workspaces
   * @property {number|null} activePalette palette that colors will be added to
   */
  static defaultSettings = {
    [MACHINE]: 'onyx',
    [MUTE]: false,
    [PROCESS_TYPE]: 'standard',
    activeColor: 'bg',
    arrivals: 0,
    colors: {
      fg: {
        h: 220,
        s: 100,
        l: 99.41,
        a: 1,
      },
      bg: {
        h: 270,
        s: 33.33,
        l: 2.35,
        a: 1,
      },
    },
    locks: {
      fg: false,
      bg: false,
    },
    historySize: 100,
    newPlayer: true,
    palettes: {},
    systemColors: { highlight: '#e0005d' },
    timeFormat: '24hr',
    volume: { effect: 100 },
    workspaces: {},
    colorHistory: [],
    activePalette: null,
    status: 'idle',
    hotkeyMode: 'default',
  }

  /**
   * instantiates a minerva object
   * @param {string} ident unique identifier for minerva
   */
  constructor(ident) {
    if (ident.replace(/\s/gi, '').trim() != ident) {
      arachne.error('invalid minerva key format')
    }

    this.events = {}
    this.temp = {}
    this.ident = ident
    this.store =
      { ...Minerva.defaultSettings, ...this.load() } || Minerva.defaultSettings
    this.hasAllSounds = false

    this.save()

    this.audioManager = new AudioManager({
      state: this,
    })
  }

  get workspaceName() {
    return this.get(MACHINE)
  }

  set workspaceName(name) {
    this.set(MACHINE, name.toLowerCase())
  }

  get workspaceType() {
    return this.get(PROCESS_TYPE)
  }

  set workspaceType(name) {
    this.set(PROCESS_TYPE, name.toLowerCase())
  }

  saveWorkspace() {
    const workspaceName = this.workspaceName
    const workspaceType = this.workspaceType

    this.workspaces[workspaceName] = {
      store: this.store,
      type: workspaceType,
    }
  }

  loadWorkspace(workspaceName) {
    let workspaceData

    try {
      workspaceData = this.get(workspaceName)
    } catch (e) {
      arachne.error('failed to load workspace json.')
      arachne.error(e)
    }

    if (workspaceData) {
      const { store, type } = workspaceData

      this.store = store
      this.workspaceType = type
      this.workspaceName = workspaceName

      this.save()
    }
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
    this.hasAllSounds &&
      this.store.audio &&
      this.audioManager.play(sound, {
        mute: this.get(MUTE),
      })
  }

  /**
   * save an item into minerva's localStorage object.
   * @param {string} key  name to save under
   * @param {any}    item thing to store
   */
  set(key, item) {
    try {
      if (key === undefined || item === undefined) {
        arachne.error('Minerva.set must be called with both a key and a value.')
        return
      }

      this.store[key] = item

      this.save()

      if (this.events[key]) this.events[key].forEach(fn => fn(item))

      return this
    } catch (err) {
      arachne.error(
        `an error occurred while trying to update localStorage: ${err}`
      )
      return
    }
  }

  place(key, item) {
    if (this.events[key]) this.events[key].forEach(fn => fn(item))

    this.temp[key] = item
  }

  pick(key) {
    return this.temp[key]
  }

  on(ev, fn) {
    if (Array.isArray(ev)) {
      for (const e of ev) {
        if (this.events[e]) this.events[e].push(fn)
        else this.events[e] = [fn]
      }

      return
    }

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

  exportConfig() {
    return JSON.stringify(this.store)
  }

  importConfig(configJSON) {
    const config = JSON.parse(configJSON)
    console.log(config)
    this.store = config
    this.save()
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
