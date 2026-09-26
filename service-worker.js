// ============================================================
// Service Worker — مرکز مطالعه ایلیا
// ============================================================

const CACHE_NAME = 'ilia-study-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css'
];

// نصب — کش کردن فایل‌های اصلی
self.addEventListener('install', (event) => {
  console.log('[SW] در حال نصب...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] کش کردن فایل‌ها');
      return cache.addAll(URLS_TO_CACHE).catch((err) => {
        console.log('[SW] بعضی فایل‌ها کش نشدن:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// فعال‌سازی — پاک کردن کش‌های قدیمی
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

// درخواست‌ها — استراتژی cache-first با آپدیت پس‌زمینه
self.addEventListener('fetch', (event) => {
  // فقط GET
  if (event.request.method !== 'GET') return;

  // درخواست‌های chrome-extension یا مشابه رو نادیده بگیر
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // فایل‌های خودمون (HTML, CSS, JS) — اول شبکه، بعد کش
      const url = event.request.url;
      const isOwnAsset = url.includes('index.html') ||
                         url.endsWith('/') ||
                         url.includes('manifest.json') ||
                         url.includes('icon.svg');

      if (isOwnAsset) {
        // Network-first برای فایل‌های اصلی (همیشه جدیدترین نسخه)
        return fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => cached || caches.match('./index.html'));
      }

      // بقیه چیزها — cache-first
      return cached || fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});

// پیام از صفحه — برای skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});