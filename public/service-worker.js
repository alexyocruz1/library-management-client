const CACHE_NAME = 'library-management-cache-v1';

self.addEventListener('install', (event) => {
    console.log('Service worker installed');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('Cache cleared');
        });
    }
});