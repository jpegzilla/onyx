import { arachne } from './../../main.mjs'
import { uuidv4 } from './../index.mjs'

/**
 * a wrapper for managing indexeddb.
 */
class Mnemosyne {
  constructor(dbName) {
    let db = window.indexedDB.open(dbName)
    this.dbReq = db
    this.storeName = `${dbName}-files`

    this.indexedDB = null
  }

  initializeIndexedDB(db) {
    db.onerror = event => {
      arachne.warn(`error with indexeddb, ${event.target.error}`)
    }

    db.onsuccess = event => {
      if (event.target instanceof IDBOpenDBRequest) {
        this.indexedDB = event.target.result
      }
    }

    db.onupgradeneeded = event => {
      arachne.log('running database upgrade')

      const db = event.target.result

      // create object store with keypath of id. keypath will cause
      // the object store to use that key as a unique index.
      const objectStore = db.createObjectStore(this.storeName, {
        keyPath: 'id',
      })

      // names can contain duplicates, but can be used to search the database
      objectStore.createIndex('name', 'name', { unique: false })

      // an index to search documents by name. must be unique
      objectStore.createIndex('id', 'id', { unique: true })
    }
  }

  addItem(item) {
    const transaction = this.indexedDB.transaction(
      [this.storeName],
      'readwrite'
    )
    const objectStore = transaction.objectStore

    return new Promise((resolve, reject) => {
      const request = objectStore.put(item)

      request.onsuccess = () => {
        resolve()
      }

      reques.onerror = err => {
        arachne.error(`error with indexeddb: ${err}`)

        reject()
      }
    })
  }
}

export default Mnemosyne
