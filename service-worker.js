const CACHE_NAME = 'workifie-cache-v2';
const urlsToCache = [
  '/',
  '/index.htm',
  '/manifest.json',
  '/icon-w.png'
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Fetch: Serve cached or fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Activate: Clear old caches and register background sync
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );

      // Background Sync registration
      try {
        await self.registration.sync.register('sync-data');
      } catch (err) {
        console.error('Background sync registration failed:', err);
      }

      // Periodic Sync registration (if supported)
      if ('periodicSync' in self.registration) {
        try {
          const result = await navigator.permissions.query({ name: 'periodic-background-sync' });
          if (result.state === 'granted') {
            await self.registration.periodicSync.register('update-content', {
              minInterval: 24 * 60 * 60 * 1000, // once a day
            });
          }
        } catch (err) {
          console.warn('Periodic Sync registration failed:', err);
        }
      }

      self.clients.claim();
    })()
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

function syncData() {
  console.log('Syncing data with server...');
  return Promise.resolve(); // Your real sync logic here
}

// Periodic Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

function updateContent() {
  console.log('Performing periodic background update...');
  return Promise.resolve(); // Your real update logic here
}

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "Workifie Notification";
  const options = {
    body: data.body || "Something happened in your app!",
    icon: '/icon-w.png'
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
