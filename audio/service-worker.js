self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('audio-store').then((cache) => cache.addAll([
        'index.html',
        'styles.css',
        'app.js',
        'output.mp3',
        'background-music.mp3',
      ])),
    );
  });
  
  self.addEventListener('fetch', (e) => {
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request)),
    );
  });
  