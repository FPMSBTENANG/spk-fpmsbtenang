// Fail: sw.js
// Service Worker untuk cache fail statik PWA (HTML, CSS, JS)

// VERSI DINAIKKAN KE V7 UNTUK MEMAKSA KEMAS KINI UI (KOTAK CARA BAYARAN)
const CACHE_NAME = 'spk-fpmsb-cache-v7';

// Senarai fail yang kita nak simpan dalam memori telefon
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/api.js',
  './js/app.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// FASA 1: Install (Simpan fail-fail utama ke dalam Cache)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Buka cache dan simpan fail utama');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// FASA 2: Activate (Buang cache lama kalau ada versi baru)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Buang cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FASA 3: Fetch (Cara app tarik fail)
// Kita guna strategi: "Utamakan Cache, kalau takde baru cari kat Internet"
// TAPI, kita abaikan (tak cache) request ke Google Apps Script (API)
self.addEventListener('fetch', event => {
  // Jangan cache data pangkalan data dari GAS
  if (event.request.url.includes('script.google.com')) {
    return; // Biarkan request ni direct pergi ke internet
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Kalau jumpa dalam cache, pulangkan yang tu. Kalau tak, pergi ambil kat internet.
        return response || fetch(event.request);
      })
  );

});
