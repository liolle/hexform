export enum DBStoreNames {
  API_CACHE = "apiCache"
}

class Database {
  #name = "hexformDB"
  #version = 1
  #db: IDBDatabase | null = null

  constructor() {
    this.#init()
  }

  async #init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.#name, this.#version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.#db = request.result
        resolve(this)
      }

      request.onupgradeneeded = function(event) {
        const db = (event.target as IDBOpenDBRequest).result
        let oldVersion = event.oldVersion

        if (oldVersion < 2) {
          const cacheStore = db.createObjectStore('apiCache', { keyPath: 'request' })
          cacheStore.createIndex('last_modified', 'last_modified')
          cacheStore.createIndex('response', 'response') // Optional if keyPath is already request
        }
      }
    })
  }

  async get(storeName: DBStoreNames) {
    return new Promise((resolve, reject) => {
      if (!this.#db) {
        reject("Db not opened")
        return
      }

      const tx = this.#db.transaction(storeName, "readonly")
      const store = tx.objectStore(storeName)
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getFromKey(storeName: DBStoreNames, key: string) {
    return new Promise((resolve, reject) => {
      if (!this.#db) {
        reject("Db not opened")
        return
      }

      const tx = this.#db.transaction(storeName, "readonly")
      const store = tx.objectStore(storeName)
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteFromKey(storeName: DBStoreNames, pattern: string) {
    return new Promise((resolve, reject) => {
      if (!this.#db) {
        reject("Db not opened")
        return
      }

      const tx = this.#db.transaction(storeName, "readwrite")
      const store = tx.objectStore(storeName)

      const range = IDBKeyRange.bound(
        pattern,                    // lower bound
        pattern + '\uffff'        // upper bound (all strings starting with pattern)
      );

      const request = store.delete(range)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateStore(storeName: DBStoreNames, value: object) {
    return new Promise((resolve, reject) => {
      if (!this.#db) {
        reject("Db not opened")
        return
      }

      const tx = this.#db.transaction(storeName, "readwrite")
      tx.objectStore
      const store = tx.objectStore(storeName)
      const request = store.put(value)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}


const DB = new Database()

export default DB 
