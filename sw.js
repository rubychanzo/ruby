// 오프라인 사용을 위한 캐시 (프로그램 파일을 바꿔 올리면 다음 실행 때 자동으로 새 버전 반영)
const CACHE = 'mhs-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;     // 구글시트 통신은 건드리지 않음
  if (/\/p\.html$/.test(u.pathname)) return;                                  // 참여자 화면은 항상 최신 것을 받음 (저장하지 않음)
  if (u.pathname.endsWith('.json')) {                                          // 설정 파일은 항상 최신 것 우선
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
