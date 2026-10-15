/* Offline support for the public site.
   - Pages: network first, fall back to the last saved copy, then to /offline.html.
   - Images, fonts, scripts, styles: served from cache, refreshed in the background.
   - Never cached: /api, /dashboard, /login & other admin/auth pages, non-GET requests. */
const VERSION = "v2";
const STATIC = `static-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const MAX_ENTRIES = 120;
const PRECACHE = ["/offline.html", "/", "/books", "/about", "/contact", "/cart", "/privacy", "/terms", "/icons/icon-192.png"];
const NEVER = [/^\/api\//, /^\/dashboard/, /^\/login/, /^\/forgot-password/, /^\/reset-password/, /^\/checkout/, /^\/order-success/];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES);
      // allSettled: one failing page must not abort the install.
      await Promise.allSettled(PRECACHE.map((url) => cache.add(url)));
      // Warm the scripts/styles/fonts each saved page needs, so saved pages are fully interactive offline.
      const assets = new Set();
      for (const url of PRECACHE) {
        try {
          const html = await (await cache.match(url))?.text();
          for (const m of html?.matchAll(/\/_next\/static\/[^"'\s)\\]+/g) ?? []) assets.add(m[0].replace(/&amp;/g, "&"));
        } catch {
          /* ignore */
        }
      }
      const statics = await caches.open(STATIC);
      await Promise.allSettled([...assets].slice(0, 150).map((a) => statics.add(a)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = [STATIC, PAGES];
      for (const key of await caches.keys()) if (!keep.includes(key)) await caches.delete(key);
      await self.clients.claim();
    })()
  );
});

async function trim(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_ENTRIES; i++) await cache.delete(keys[i]);
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone());
      trim(cacheName);
    }
    return response;
  } catch {
    const cached = (await cache.match(request, { ignoreVary: true })) || (await cache.match(request.url.split("?")[0]));
    if (cached) return cached;
    if (fallbackUrl) {
      const offline = await (await caches.open(PAGES)).match(fallbackUrl);
      if (offline) return offline;
    }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        trim(STATIC);
      }
      return response;
    })
    .catch(() => null);
  return cached || (await refresh) || new Response("", { status: 504 });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER.some((re) => re.test(url.pathname))) return;

  const isNavigation = request.mode === "navigate";
  const isRsc = request.headers.get("RSC") === "1" || url.searchParams.has("_rsc");

  if (isNavigation) {
    event.respondWith(networkFirst(request, PAGES, "/offline.html"));
  } else if (isRsc) {
    event.respondWith(networkFirst(request, PAGES, null));
  } else if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/books/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:png|jpe?g|webp|avif|svg|ico|woff2?|css|js)$/.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
