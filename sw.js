// 오프라인 저장: 한 번 열어 둔 페이지·지도·글꼴을 인터넷 없이도 보이게
const C = 'kk-trip-v4';
const PRE = ['./', './index.html', './map-1.png', './map-2.png', './map-3.png', './icon-192.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => Promise.allSettled(PRE.map(u =>
    fetch(u, u.startsWith('http') ? {mode: 'no-cors'} : {}).then(r => c.put(u, r))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {            // 페이지: 최신 우선, 안 되면 저장본
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {   // 그 외: 저장본 먼저, 뒤에서 새로 받기
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(C).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
