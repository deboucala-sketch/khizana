// عامل الخدمة: يحفظ التطبيق للعمل دون إنترنت. يتغيّر رقم الإصدار تلقائياً مع كل نسخة جديدة من التطبيق.
const VERSION = 'khizana-v-b058fceca9';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const CDN = /^(cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k.startsWith('khizana-v-') && k !== VERSION).map(k => caches.delete(k))))
  .then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin) {   // ملفات التطبيق: الشبكة أولاً (لتصل التحديثات)، ثم المحفوظ دون اتصال
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  } else if (CDN.test(u.hostname)) {    // مكتبات محرّك القراءة ونماذج اللغة: ثابتة الإصدار، فالمحفوظ أولاً
    e.respondWith(caches.open('khizana-cdn').then(async c => {
      const hit = await c.match(req); if (hit) return hit;
      const r = await fetch(req); if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r;
    }));
  }   // طلبات مزوّدي الذكاء الاصطناعي تمرّ كما هي دون تخزين
});
