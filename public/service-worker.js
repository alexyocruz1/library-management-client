const CACHE_NAME = 'library-management-cache-v2'; // Increment this version when you update your app
const RUNTIME = 'runtime';

// List of assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  // Add other static assets you want to cache
];

// Installation - precache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(self.skipWaiting())
    );
});

// Activation - clean up old caches
self.addEventListener('activate', (event) => {
    const currentCaches = [CACHE_NAME, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

// Fetch - network first, then cache
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // If the response was good, clone it and store it in the cache
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(RUNTIME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // If the network request fails, try to get it from the cache
                    return caches.match(event.request);
                })
        );
    }
});

// Handle cache clearing
self.addEventListener('message', (event) => {
    if (event.data === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('Cache cleared');
        });
        caches.delete(RUNTIME).then(() => {
            console.log('Runtime cache cleared');
        });
    }
});