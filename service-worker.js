// Service Worker — نسخه 6
const CACHE_NAME = 'ilia-study-v1793113179165';
const URLS = [
  './db.js',
  './style.css',
  './app.js',
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
const FONT_URL = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css';

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all([
        cache.addAll(URLS).catch(() => {}),
        cache.add(FONT_URL).catch(() => {}) // ⭐ FIX: کش فونت
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// ⭐ FIX: cache-first با fallback درست
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // فقط same-origin و فونت CDN رو کش کن
  if (url.origin !== location.origin && !url.href.startsWith('https://cdn.jsdelivr.net/')) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request);
      const networkPromise = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          cache.put(event.request, response.clone()).catch(() => {});
        }
        return response;
      }).catch(() => null);
      return cached || (await networkPromise) || new Response('Offline', {
        status: 503,
        statusText: 'Offline',
        headers: {'Content-Type': 'text/plain; charset=utf-8'}
      });
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});