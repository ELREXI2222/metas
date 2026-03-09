const CACHE_NAME = 'metas-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './styles/main.css',
    './styles/components.css',
    './styles/animations.css',
    './scripts/main.js',
    './scripts/storage.js',
    './scripts/ui.js',
    './scripts/logic.js',
    './manifest.json',
    './icons/icon-512.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Cache and return requests
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Update Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
