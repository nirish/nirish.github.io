// Name of the cache storage
const CACHE_NAME = 'dram-tracker-cache-v1';

// List of all files the Service Worker should cache immediately
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    'icon-192.png', // You'll need to create these image files
    'icon-512.png',
    // Important CDN assets needed for the app to run offline
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js', // Use production version for better speed
    'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://unpkg.com/lucide@latest',
    'https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js',
];

// --- INSTALL EVENT ---
self.addEventListener('install', (event) => {
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
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response; // Cache hit
                }
                
                return fetch(event.request).then(
                    (response) => {
                        // Skip caching Firebase transactions or large external data
                        if (!response || response.status !== 200 || response.type !== 'basic' || 
                            event.request.url.includes('firebase') || event.request.url.includes('googleapis')) {
                            return response;
                        }

                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// --- ACTIVATE EVENT ---
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
