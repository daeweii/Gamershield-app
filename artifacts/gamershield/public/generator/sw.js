// Service worker for the password generator page: makes it work offline.
// It only stores the page's own files (HTML, JS, CSS, icons). It never sees or
// stores passwords: those exist only in the page's memory and are never requested
// from the network, so nothing about them passes through here.

const CACHE = 'gamershield-generator-v1';
const SCOPE = self.registration.scope; // e.g. https://site/gamershield/generator/

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Fetch the page, then save every same-origin file its HTML points to.
    const response = await fetch(SCOPE, { cache: 'no-store' });
    const html = await response.clone().text();
    const urls = new Set([SCOPE, new URL('manifest.webmanifest', SCOPE).href]);
    for (const icon of ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) urls.add(new URL(icon, SCOPE).href);
    for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const absolute = new URL(url, SCOPE);
      if (absolute.origin === self.location.origin) urls.add(absolute.href);
    }
    await cache.put(SCOPE, response);
    urls.delete(SCOPE);
    await cache.addAll([...urls]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('gamershield-generator-') && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Page itself: try the network first so updates arrive; fall back to the saved copy offline.
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        if (fresh.ok) (await caches.open(CACHE)).put(SCOPE, fresh.clone());
        return fresh;
      } catch {
        return (await caches.match(SCOPE)) ?? Response.error();
      }
    })());
    return;
  }

  // Built files have content hashes in their names, so a saved copy is always correct.
  event.respondWith((async () => {
    const saved = await caches.match(request);
    if (saved) return saved;
    const fresh = await fetch(request);
    if (fresh.ok) (await caches.open(CACHE)).put(request, fresh.clone());
    return fresh;
  })());
});
