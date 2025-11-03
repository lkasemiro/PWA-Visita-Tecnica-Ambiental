const CACHE_NAME = 'form-cedae-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => { if(key !== CACHE_NAME) return caches.delete(key); })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  // responde do cache primeiro, senão busca na rede
  evt.respondWith(
    caches.match(evt.request).then((resp) => {
      return resp || fetch(evt.request).then(networkResp => {
        // opcional: cachear novas requisições (somente respostas de sucesso)
        if(evt.request.method === 'GET' && networkResp && networkResp.status === 200 && evt.request.url.startsWith(self.location.origin)){
          const respClone = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(evt.request, respClone));
        }
        return networkResp;
      }).catch(() => {
        // fallback para o index (útil quando estamos offline navegando na SPA)
        return caches.match('./index.html');
      });
    })
  );
});