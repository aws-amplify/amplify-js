# Cache

The Amplify Cache module provides a generic [LRU](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_.28LRU.29) cache to JavaScript developers for storing data with priority and expiration settings. It is a key/value structure where expiration values can be configured globally or on a per-key basis. For instance you may wish to cache JSON responses from the API module as well as input values that a user enters into an application (preferences, UX configuration, etc.).

* [Installation](#installation)
* [Integration](#integration)
  - [Integrate into Web application](#1-integrate-into-web-application)
  - [Integrate into React Native](#2-integrate-into-react-native)
* [Configuration](#configuration)


## Installation

For Web development, install `aws-amplify`
```bash
npm install aws-amplify
```

For React Native development, install `aws-amplify-react-native`
```bash
npm install aws-amplify-react-native
```

## Integration

### Integrate into Web application

First import the library:
```js
import { Cache } from ‘aws-amplify’;
```

After importing you can invoke the appropriate methods from your application.

- **setItem()**

  You can set number, string, boolean or object into the cache. You can also specify options along with the call such as the priority or expiration time.

```js
Cache.setItem(key, value[, options]);
    
// Standard case
Cache.setItem('key', 'value');

// Set item with priority. Priority should be between 1 and 5.
Cache.setItem('key', 'value', { priority: 3 });

// Set item with an expiration time
const expiration = new Date(2018, 1, 1);
Cache.setItem('key', 'value', { expires: expiration.getTime() });
```

When using the `priority` setting the lower number will be evicted last. For example:

```js
Cache.setItem('mothersBirthday', 'July 18th', { priority: 1 });
Cache.setItem('breakfastFoodOrder', 'Pancakes', { priority: 3 });
```

In the example above once the cache fills, the key of `breakfastFoodOrder` will be evicted before `mothersBirthday`.

- **getItem()**

  Retrieve an item from the cache. It will return null if the item doesn’t exist or it has expired.

```js
Cache.getItem(key[, options]);

// Standard case
Cache.getItem('key');

// Get item with callback function. 
// The callback function will be called if the item is not in the cache. 
// After the callback function returns, the value will be set into cache.
Cache.getItem('key', { callback: callback });
```

- **removeItem()**

  Remove item from cache.

```js
Cache.removeItem(key);
```

- **clear()**

Clears all of the items in the cache.

```js
Cache.clear();
```

- **getAllKeys()**

  Returns all of the keys in the cache.

```js
Cache.getAllKeys();
```

- **getCacheCurSize()**

  Returns the current size of the cache.

```js
const size = Cache.getCacheCurSize();
```

- **configure()**

  Configure Cache such as default settings for `setItem` functionality. You can see all the options in the [Configuration](#configuration) section.

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

- **createInstance()**

  Create a new instance of Cache with customized configuration

```js
const config = {
  itemMaxSize: 3000, // 3000 bytes
  storage: window.sessionStorage // switch to sessionStorage
  // ...
};
const myCache = Cache.createInstance(config);
// Please provide a new keyPrefix which is the identifier of Cache.
```

### Integrate into React Native

First Import
```js
import { Cache } from ‘aws-amplify-react-native’;
```
Then call the methods

- **setItem()**

  You can set number, string, boolean or object into the cache. You can also specify options along with the call such as the priority or expiration time.

```js
Cache.setItem(key, value[, options]);
    
// Standard case
Cache.setItem('key', 'value');

// Set item with priority. Priority should be between 1 and 5.
Cache.setItem('key', 'value', { priority: 3 });

// Set item with an expiration time
const expiration = new Date(2018, 1, 1);
Cache.setItem('key', 'value', { expires: expiration.getTime() });
```

- **getItem()**

  Retrieve an item from the cache. It will return null if the item doesn’t exist or it has expired.

```js
Cache.getItem(key[, options]);

// Standard case
Cache.getItem('key');

// Get item with callback function. 
// The callback function will be called if the item is not in the cache. 
// After the callback function returns, the value will be set into cache.
Cache.getItem('key', { callback: callback });
```

- **removeItem()**

  Remove item from cache.

```js
Cache.removeItem('key');
```


- **clear()**

  Clear all items in the cache.

```js
Cache.clear();
```

- **getAllKeys()**

  Return all the keys in the cache.

```js
Cache.getAllKeys().then(keys => {...});
```

 - **getCacheCurSize()**

  Return the current size of the cache.

```js
const size = Cache.getCacheCurSize().then(size => {...});
```

- **configure()**

Configure Cache with customized cnofiguration and return the configuration. You can see all the options in the [Configuration](#configuration) section.

```js
const config = {
  itemMaxSize: 3000, // 3000 bytes
  defaultPriority: 4
  // ...
};
const myCacheConfig = Cache.configure(config);

// You can modify parameters such as cache size, item default ttl and etc.
// But don't modify keyPrefix which is the identifier of Cache.
```

- **createInstance()**

Create a new instance of Cache with customized configuration

```js
const config = {
  itemMaxSize: 3000, // 3000 bytes
  defaultPriority: 4
  // ...
};
const myCache = Cache.createInstance(config);
// Please provide a new keyPrefix which is the identifier of Cache.
```

## Configuration

### Cache configuration:

1. keyPrefix: string

The ID of Cache which can only be configured when creating new instance.

2. capacityInBytes: number

Max size of Cache in bytes. By default is 1MB and has a maximum of 5MB. Unit is one byte.

3. itemMaxSize: number

Max size of item which can be set into Cache. By default is 200KB. Unit is one byte.

4. defaultTTL: number

Default ttl of the item. By default is 72 hours. Unit is one millisecond.

5. defaultPriority: number

Default priority of the item. By default is 5. The highest priority is 1.

6. warningThreshold: number

This is to keep Cache's current capacity in a reasonable level. By default is 0.8, which means to keep Cache around 80% space usage.

7. storage: Storage

The storage medium used to keep your Cache data. Supported mediums are LocalStorage(default) and SessionStorage for Web development and AsyncStorage for React Native.

### Item Configuration:

1. prority: number

Priority of the item.

2. expires: number

The expiration time of the cache item.

3. callback: function

The callback function can be specified when using getItem(). It will be used to fetch data when there is no such item in the Cache. Cache will store the data after fetching from the callback function.
