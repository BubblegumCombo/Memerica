// Minimal app-shell service worker for installability + basic offline.
// Richer offline/precaching + push come in Phase 5 (PWA polish).
const CACHE = "memerica-shell-v1";
const SHELL = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Only handle same-origin requests — never intercept S3 / Supabase / fonts.
  if (new URL(request.url).origin !== self.location.origin) return;

  // Network-first for navigations so content stays fresh; fall back to shell.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
    return;
  }

  // Cache-first for everything else (Next assets are content-hashed).
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
