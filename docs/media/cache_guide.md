---
---
# Cache

The Amplify Cache module provides a generic [LRU](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_.28LRU.29) cache for JavaScript developers to store data with priority and expiration settings. 

It is a key/value structure where expiration values can be configured **globally** or on a **per-key basis**. For instance, you may wish to cache all JSON responses from the API module for the next 10 minutes, but like to store user input values or preferences for a month.  

## Installation

Install `aws-amplify`.
```bash
npm install aws-amplify
```

## Working with the API

First, import the library:
```js
import { Cache } from 'aws-amplify';
```

After the import, you can invoke the appropriate methods within your application.

### setItem()

```js
Cache.setItem(key, value, [options]);
```

You can set *number*, *string*, *boolean* or *object* values to the cache. You can also specify options along with the call such as the priority or expiration time.

```js
// Standard case
Cache.setItem('key', 'value');

// Set item with priority. Priority should be between 1 and 5.
Cache.setItem('key', 'value', { priority: 3 });

// Set item with an expiration time
const expiration = new Date(2018, 1, 1);
Cache.setItem('key', 'value', { expires: expiration.getTime() });
```

When using `priority` setting, the cached item with the lower number will be expired first. The Cache module decides expiration based on the memory available to the cache. In the following example,`breakfastFoodOrder` will be expired before `mothersBirthday`.


```js
Cache.setItem('mothersBirthday', 'July 18th', { priority: 1 });
Cache.setItem('breakfastFoodOrder', 'Pancakes', { priority: 3 });
```

### getItem()

```js
Cache.getItem(key[, options]);
```
  Retrieves an item from the cache. It will return null if the item doesn’t exist or it has expired.

```js
// Standard case
Cache.getItem('key');

// Get item with callback function.
// The callback function will be called if the item is not in the cache.
// After the callback function returns, the value will be set into cache.
Cache.getItem('key', { callback: callback });
```

### removeItem()

  Removes item from cache.

```js
Cache.removeItem(key);
```

### clear()

Removes all of the items in the cache.

```js
Cache.clear();
```

### getAllKeys()

Returns all of the keys available in the cache.

```js
Cache.getAllKeys();
```

### getCacheCurSize()

Returns the current size of the cache in bytes.

```js
const size = Cache.getCacheCurSize();
```

### configure()

Configures default settings for `setItem` functionality. You can see all available options in [Configuration](#configuration) section.

```js
const config = {
  itemMaxSize: 3000, // 3000 bytes
  defaultPriority: 4
  // ...
};
const myCacheConfig = Cache.configure(config);

// You can modify parameters such as cache size, item default ttl and etc.
// But don't try to modify keyPrefix which is the identifier of Cache.
```

### createInstance()

Creates a new instance of Cache with custom configuration.

```js
const config = {
  itemMaxSize: 3000, // 3000 bytes
  storage: window.sessionStorage // switch to sessionStorage
  // ...
};
const newCache = Cache.createInstance(config);
// Please provide a new keyPrefix which is the identifier of Cache.
```

### API Reference

For the complete API documentation for Cache module, visit our [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/api/classes/cacheobject.html)
{: .callout .callout--info}


## Configuration

### Configuration Parameters

Here is the list of configuration parameters for the Cache module:

**Parameter** | **Type** | **Description**
keyPrefix | *string* | The ID of Cache which can only be configured when creating new instance.
capacityInBytes | *number* | Max size of Cache in bytes. By default is 1MB and has a maximum of 5MB.  
itemMaxSize |  *number* | Max size of individual item which can be set into Cache in bytes. The default value is 200KB.  
defaultTTL | *number* | TTL for the cache items in milliseconds. The default value is 72 hours.  
defaultPriority | *number* | Default priority of the cache items. The default value is 5, the highest priority is 1.
warningThreshold | *number* | This is for keeping Cache's current capacity in a reasonable level. The default is 0.8, which sets warnings for 80% of space usage.
storage | *StorageType* | The storage medium that will be used for the Cache. Supported values are *LocalStorage*(default) and *SessionStorage* for Web development and *AsyncStorage* for React Native.

### Configuration Parameters for Items

Here is the list of configuration parameters for the items in the cache :

**Parameter** | **Type** | **Description**
priority | *number* | Priority of the item to be kept in cache. Higher priority means longer expiration time. 
expires | *number* | The expiration time of the cache item in milliseconds.
callback | *function* | You can provide a callback function with getItem() to implement cache miss scenarios. The provided function will only be called if there is not a match for the cache key, and the return value from the function will be assigned as the new value for the key in cache.  

## Using Modular Imports

If you only need to use Cache, you can do: `npm install @aws-amplify/cache` which will only install the Cache module for you.

Then in your code, you can import the Cache module by:
```js
import Cache from '@aws-amplify/cache';

Cache.configure();

```
