// オフラインでも開けるようにするための仕組み。
// 一度開いたファイルを端末に取っておき、次からは手元の控えをすぐ出しつつ裏で新しい版を取りにいく。
// 更新を確実に反映したいときは、下の名前の数字を上げる。
const CACHE = 'film-note-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
