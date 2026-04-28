const CACHE_NAME = 'colacion-v2'; // Actualizamos la versión de caché
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
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Abriendo caché v2');
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

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; 
                }
                return fetch(event.request);
            })
    );
});
