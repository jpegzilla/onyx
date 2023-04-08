const FILES_TO_CACHE = ['./index.html', './css/main.min.css']

const ONYX_VERSION = 'v0005'
const CACHE_NAME = `onyx_cache_${ONYX_VERSION}`
const cacheWhitelist = [CACHE_NAME]

self.addEventListener('install', event => {
  self.skipWaiting()

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('[serviceworker] pre-caching offline page')
        return cache.addAll(FILES_TO_CACHE)
      })
      .then(() => {
        caches.keys().then(keyList => {
          return Promise.all(
            keyList.map(key => {
              if (cacheWhitelist.indexOf(key) === -1) {
                console.log('[serviceworker] removing old key in cache: ', key)
                return caches.delete(key)
              }
            })
          )
        })
      })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response

      return fetch(event.request)
        .then(response => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic' ||
            event.request.url.startsWith('chrome-extension')
          )
            return response

          const responseToCache = response.clone()

          caches
            .open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache))

          return response
        })
        .catch(err => {
          // fallback mechanism
          console.error(
            '[serviceworker]: error ',
            err.message,
            event.request.url
          )
          return caches.open(CACHE_NAME).then(cache => {
            return cache.match('./index.html')
          })
        })
    })
  )
})
