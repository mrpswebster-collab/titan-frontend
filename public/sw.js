// TITAN Service Worker — Purge & Unregister Self (replaces titan-portal-v1)
const CACHE_NAME = 'titan-portal-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Always passthrough directly to network without caching
  event.respondWith(fetch(event.request));
});
