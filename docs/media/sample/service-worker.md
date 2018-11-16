---
---
```js

/**
 * @copyright 2018 Amazon Web Services
 * 
 * An example service worker that utilizes lifecycle events.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
 * 
 * This service worker provides the means to cache local static assets
 * into browsers Cache Storage as well as network requests using the 
 * fetch events. Network requests and static assets are cached and
 * available offline. Other strategies exist for offline application development:
 * https://hacks.mozilla.org/2016/10/offline-strategies-come-to-the-service-worker-cookbook/
 * 
 */

/**
 * Static assets to cache. This is specific on your application
 * and build process and framework
 */
var appCacheFiles = [
	'/',
	'/index.html'
], 
// The name of the Cache Storage
appCache = 'aws-amplify-v1';

/**
 * The install event is fired when the service worker 
 * is installed.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
addEventListener('install', (event) => {
	console.log('[Service Worker] Install Event', event)
	event.waitUntil(
    	caches.open(appCache).then(function(cache) {
	      return cache.addAll(appCacheFiles);
    	})
  	);
})

/**
 * The activate vent is fired when the  service worker is activated
 * and added to the home screen.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
addEventListener('activate', (event) => {
	console.log('[Service Worker] Activate Event ', event)
})

/**
 * The fetch event is fired for every network request. It is also dependent
 * on the scope of which your service worker was registered.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
addEventListener('fetch', function(event) {
	//return fetch(event.request);
  console.log('[Service Worker] Fetch: ', event);
	let url = new URL(event.request.url);
	//url.pathname
  event.respondWith(
    caches.match(event.request).then(function(resp) {
      return resp || fetch(event.request).then(function(response) {
        return caches.open(appCache).then(function(cache) {
          if (event.request.method === 'GET') {
          	cache.put(event.request, response.clone());
      	  }
          return response;
        });
      });
    })
	);
});
/**
 * The message will receive messages sent from the application.
 * This can be useful for updating a service worker or messaging
 * other clients (browser restrictions currently exist)
 * https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
 */
addEventListener('message', (event) => {
	console.log('[Service Worker] Message Event: ', event.data)
})

/**
 * Listen for incoming Push events
 */
addEventListener('push', (event) => {
	console.log('[Service Worker] Push Received.');
	console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

	if (!(self.Notification && self.Notification.permission === 'granted'))
		return;
		
	var data = {};
  if (event.data)
    data = event.data.json();

	var title = data.title || "Web Push Notification";
	var message = data.message || "New Push Notification Received";
	var icon = "images/notification-icon.png";
	var badge = 'images/notification-badge.png';
	var options = {
		body: message,
		icon: icon,
		badge: badge
	};
	event.waitUntil(self.registration.showNotification(title,options));
});

/**
 * Handle a notification click
 */
addEventListener('notificationclick', (event) => {
	console.log('[Service Worker] Notification click: ', event);
	event.notification.close();
	event.waitUntil(
		clients.openWindow('https://aws-amplify.github.io/amplify-js')
	);
});

```