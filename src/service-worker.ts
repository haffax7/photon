/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// This used to also intercept every fetch to serve a custom offline-caching
// strategy (precache + cache-first/network-first fallback). That turned out
// to be a real liability: in Safari specifically, the intercepted fetch()
// calls inside the 'fetch' handler would intermittently fail with a generic
// "TypeError: Load failed", which SvelteKit's module loader then surfaced as
// "Failed to fetch dynamically imported module" / "Importing a module
// script failed" - a production-breaking bug for no feature anyone asked
// for. Keeping only install/activate (to replace old service worker
// versions cleanly) and dropping the fetch interception removes that whole
// failure mode: the browser's own network stack handles every request
// directly instead of going through this worker.

self.addEventListener('install', () => {
  console.info('[i] Installing service worker')
  // Activate this version immediately instead of waiting for all open tabs
  // of the old version to close.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.info('[i] Activating service worker')

  async function cleanup() {
    for (const key of await caches.keys()) {
      await caches.delete(key)
    }
    await self.clients.claim()
  }

  event.waitUntil(cleanup())
})
