/**
 * Service Worker for BIDS Asbestos & Mold COC Collector PWA
 * Cache Version: bids-coc-v8
 */
const CACHE_NAME = 'bids-coc-v8';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// 1. Install Event - Pre-cache all essential application assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event - Clear obsolete caches (purges bids-coc-v7 and earlier)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event - Serve offline cache or fall back to network
self.addEventListener('fetch', (event) => {
  // Let POST sync requests to Google Apps Script pass directly to the network
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cached asset if available
      }
      return fetch(event.request).catch(() => {
        // If offline and navigating to a page, serve the cached index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});