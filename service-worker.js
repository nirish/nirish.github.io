// Name of the cache storage
const CACHE_NAME = 'dram-tracker-cache-v5'; // Incremented cache name

// List of all files the Service Worker should cache immediately
const urlsToCache = [
    'index.html',
    'manifest.json',
    'icon-192.png', 
    'icon-512.png',
    // Important CDN assets
    // 'https://cdn.tailwindcss.com', // REMOVED to prevent CORS error
    'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js', 
    'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://unpkg.com/lucide@latest/dist/umd/lucide.js', // Core lucide
    // Firebase v8 - CORRECTED URLs
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js'
];

// --- INSTALL EVENT ---
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force the new service worker to activate
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('SW: Pre-caching essential assets.');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('SW: Failed to pre-cache assets:', err);
            })
    );
});

// --- FETCH EVENT ---
self.addEventListener('fetch', (event) => {
    // IMPORTANT: Do not cache non-http requests (like chrome-extension://)
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // For navigation requests (like loading the page), always go to the network first
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Good response? Clone it and cache it.
                    if (response.ok) {
                        const resClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request).then(response => response || caches.match('index.html')))
        );
    } else {
        // For all other requests (scripts, images), use cache-first
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response; // Cache hit
                    }
                    // Not in cache? Go to network.
                    return fetch(event.request).then(
                        (response) => {
                            // Don't cache failing or non-basic requests
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                            return response;
                        }
                    );
                })
        );
    }
});

// --- ACTIVATE EVENT ---
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName); // Delete old caches
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control of open pages
    );
});
