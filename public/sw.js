const CACHE = 'fitdraw-v3'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          const cache = await caches.open(CACHE)
          event.waitUntil(cache.put('/', response.clone()).catch(() => {}))
        }
        return response
      } catch {
        return (await caches.match('/')) || new Response('Offline', { status: 503, statusText: 'Offline' })
      }
    })())
    return
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE)
    const cached = await cache.match(request)
    if (cached) {
      event.waitUntil(
        fetch(request)
          .then((response) => response.ok ? cache.put(request, response.clone()) : undefined)
          .catch(() => undefined),
      )
      return cached
    }
    try {
      const response = await fetch(request)
      if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
        event.waitUntil(cache.put(request, response.clone()).catch(() => {}))
      }
      return response
    } catch {
      return new Response('', { status: 504, statusText: 'Offline' })
    }
  })())
})
