const CACHE_NAME = 'colacion-v3'; // Actualizamos la versión de caché para forzar la recarga
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './alumnos.js',
    './database.js',
    './scanner.js',
    './manifest.json',
    // Cachear librerías externas para carga completa offline
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/html5-qrcode'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Forzar actualización inmediata
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Abriendo caché v3');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Borrando caché antigua', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Estrategia Network-First: Siempre intentar obtener la última versión, si falla (offline), usar caché
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Si hay internet, actualizamos la caché con la nueva versión
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
            .catch(() => {
                // Si falla (estamos offline), servimos desde la caché
                return caches.match(event.request);
            })
    );
});
