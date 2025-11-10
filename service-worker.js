
const CACHE_NAME = 'aqua-sentinel-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/components/Detector.tsx',
  '/components/News.tsx',
  '/components/Settings.tsx',
  '/components/Tides.tsx',
  '/components/BottomNav.tsx',
  '/components/IndonesiaMap.tsx',
  '/components/icons/HomeIcon.tsx',
  '/components/icons/NewsIcon.tsx',
  '/components/icons/SettingsIcon.tsx',
  '/components/icons/TideIcon.tsx',
  '/components/icons/UserIcon.tsx',
  '/components/icons/SunIcon.tsx',
  '/components/icons/MoonIcon.tsx'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache for Aqua Sentinel');
        // Use individual adds to be resilient to single file failures
        const cachePromises = URLS_TO_CACHE.map(urlToCache => {
          return cache.add(urlToCache).catch(err => {
            console.warn(`Failed to cache ${urlToCache}:`, err);
          });
        });
        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - fetch from network, cache, and return
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response.
            // Opaque responses (from no-cors requests to CDNs) will have status 0, which is fine.
            if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetch failed; trying to serve from cache if available.', error);
          // If fetch fails (e.g., offline), we still try to match from cache.
          return caches.match(event.request);
        });
      })
  );
});
