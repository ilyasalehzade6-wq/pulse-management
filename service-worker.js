// ============================================================
// Service Worker — نسخه بهینه برای موبایل
// ============================================================

const CACHE_NAME = 'ilia-study-v2';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css'
];

// ✅ نصب — کش کردن فایلهای اصلی
self.addEventListener('install', (event) => {
  console.log('[SW] نصب...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] کش کردن فایلها');
      return cache.addAll(URLS_TO_CACHE).catch((err) => {
        console.log('[SW] خطا در کش:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ✅ فعالسازی — پاک کردن کشهای قدیمی
self.addEventListener('activate', (event) => {
  console.log('[SW] فعال شد');
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] حذف کش قدیمی:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ✅ handlerfetch — مهمترین بخش برای نصب PWA روی موبایل
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});