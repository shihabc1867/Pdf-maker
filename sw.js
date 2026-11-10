const CACHE = 'pdf-toolkit-v3';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const save = res => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  };
  // Pages: network first so updates arrive, cache as offline fallback
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(save).catch(() => caches.match(req).then(h => h || caches.match('./index.html'))));
    return;
  }
  // Everything else (libraries, language data): cache first
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(save)));
});
