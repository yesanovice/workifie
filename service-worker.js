const CACHE_NAME = 'workifie-cache-v1';
const urlsToCache = [
  '/',
  '/index.htm',
  '/manifest.json',
  '/icon-w.png', // Fixed path if icon is directly in root
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Fetch: Serve cached or fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
  );
});

// Activate: Remove old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});


// 🔄 Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

function syncData() {
  // Replace this with your actual sync logic (API call, etc.)
  console.log('Syncing data with server...');
  return Promise.resolve(); // Simulate successful sync
}


// 🕐 Periodic Sync (requires browser support and permission)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

function updateContent() {
  // Replace this with actual update logic
  console.log('Performing periodic background update...');
  return Promise.resolve(); // Simulate update
}


// 🔔 Push Notifications
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
