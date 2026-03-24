const CACHE_NAME = 'globe-dashboard-v1';
const DYNAMIC_CACHE = 'globe-dynamic-data-v1';

// Static assets to cache immediately on install
const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js'
];

// Install Event - Precache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Precaching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map((key) => {
                if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
                    console.log('Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

// Fetch Event - Network First, then Cache (Good for dynamic APIs and CDNs)
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Handle API calls and external CDNs (Globe.gl, Three.js, RestCountries, Images)
    event.respondWith(
        fetch(req).then((networkResponse) => {
            // If network fetch is successful, clone and cache it dynamically
            return caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(req, networkResponse.clone());
                return networkResponse;
            });
        }).catch(() => {
            // If offline, try to return from cache
            return caches.match(req).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                // If not in cache and offline, fail gracefully (you could return a custom offline page here)
                console.warn('Offline and resource not found in cache:', req.url);
            });
        })
    );
});