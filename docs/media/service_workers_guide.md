---
---
# Service Workers

AWS Amplify *ServiceWorker* class enables registering a service worker in the browser and communicating with it via *postMessage* events, so that you can create rich offline experiences with [Push APIs](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) and analytics. 

After registering the service worker, the ServiceWorker module will listen and attempt to dispatch messages on state changes, and it will record analytics events based on the service worker's lifecycle.

*postMessage* events are currently not supported in all browsers. For details and to learn more about Service Worker API, please [visit here](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/).
{: .callout .callout--info}

## Installation

Import *ServiceWorker* and instantiate a new instance (you can have mulitple workers on different scopes):
```js
import { ServiceWorker } from 'aws-amplify';
const myServiceWorker = new ServiceWorker();
```

## Working with the API

### register()

You can register a service worker for the browser with `register` method. 

First, you need to create a service worker script **service-worker.js**. Your service worker script includes cache settings for offline access and event handlers for related lifecycle events. [Click to see a sample service worker script]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/sample/service-worker) for your app. 

Make sure that worker script is included with your build and provide a script path relative to the source directory when registering:

```js
// Register the service worker with `service-worker.js` with service worker scope `/`.
myServiceWorker = await this.serviceWorker.register('/service-worker.js', '/');
```

This method will enable web push notifications for your app. If your app is not previously subscribed to the push service to receive notifications, a new subscription will be created with the provided *public key*. 

```js
    myServiceWorker.enablePush('BLx__NGvdasMNkjd6VYPdzQJVBkb2qafh')
```

You need a web push service provider to generate the public key, and sending the actual push notifications. To test push messages with a non-production environment, you can follow [this tutorial](https://developers.google.com/web/fundamentals/codelabs/push-notifications/).
{: .callout .callout--info}

### Handling a Push Notification

To handle incoming push notifications in your service worker, your script should register an event handler for `push` event.

In your *service-worker.js* file, add following event listener:

```js
/**
 * Listen for incoming Push events
 */

addEventListener('push', (event) => {
    var data = {};
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    if (!(self.Notification && self.Notification.permission === 'granted')) 
        return;
    
    if (event.data) 
        data = event.data.json();
    
    // Customize the UI for the message box 
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
```

For more information about Notifications API, please visit [here](https://developer.mozilla.org/en-US/docs/Web/API/notification).

### send()

`send` method sends a message to your service worker, from your web app. Remember that your app's code and service worker script work in different contexts, and the communication between the two is possible with *send()* method.

This is useful when you want to control your service worker logic programmatically from your app, such as cleaning the service worker cache:

```js

    myServiceWorker.send({
      'message': 'CleanAllCache'
    });

```

For more information about Message API, please visit [here](https://developer.mozilla.org/en-US/docs/Web/Events/message_(ServiceWorker)).


#### Receiving Messages 

To receive the messages in your service worker, you need to add an event handler for **message** event.

In your *service-worker.js* file, add the following event listener:

```js
    /**
     * The message will receive messages sent from the application.
     * This can be useful for updating a service worker or messaging
     * other clients (browser restrictions currently exist)
     * https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
     */
    addEventListener('message', (event) => {
        console.log('[Service Worker] Message Event: ', event.data)
    })
    
```

### Monitoring Lifecycle Events

If you enable AWS Amplify [Analytics]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/analytics_guide) category, *ServiceWorker* module automatically tracks service worker state changes and message events.

You can see those analytics events are related metrics in Amazon Pinpoint console.

### API Reference

For the complete API documentation for ServiceWorker module, visit our [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/api/classes/serviceworkerclass.html)
{: .callout .callout--info}


## Using Modular Imports

If you only need to use ServiceWorker, you can do: `npm install @aws-amplify/core` which will only install the Core module which contains the ServiceWorkder module.

Then in your code, you can import the Analytics module by:
```js
import { ServiceWorker } from '@aws-amplify/core';

```
