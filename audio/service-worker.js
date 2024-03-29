self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('audio-store').then((cache) => cache.addAll([
        'index.html',
        'app.js',
      ])),
    );
  });
  
  self.addEventListener('fetch', (e) => {
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request)),
    );
  });
  