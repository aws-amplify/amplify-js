"use strict";
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("./Utils");
var StorageCache_1 = require("./StorageCache");
var Common_1 = require("../Common");
var logger = new Common_1.ConsoleLogger('InMemoryCache');
/**
 * provide an object as the in-memory cache
 */
var CacheObject = /** @class */ (function () {
    function CacheObject() {
        this.store = {};
        logger.debug('Using InMemoryCache');
    }
    CacheObject.prototype.clear = function () {
        this.store = {};
    };
    CacheObject.prototype.getItem = function (key) {
        return this.store[key] || null;
    };
    CacheObject.prototype.setItem = function (key, value) {
        if (key in this.store) {
            this.removeItem(key);
        }
        this.store[key] = value;
    };
    CacheObject.prototype.removeItem = function (key) {
        delete this.store[key];
    };
    CacheObject.prototype.showItems = function () {
        var str = 'show items in mock cache: \n';
        for (var key in this.store) {
            str += key + '\n';
        }
        logger.info(str);
    };
    return CacheObject;
}());
/**
 * Customized in-memory cache with LRU implemented
 * @member cacheObj - object which store items
 * @member cacheList - list of keys in the cache with LRU
 * @member curSizeInBytes - current size of the cache
 * @member maxPriority - max of the priority
 * @member cacheSizeLimit - the limit of cache size
 */
var InMemoryCache = /** @class */ (function (_super) {
    __extends(InMemoryCache, _super);
    /**
     * initialize the cache
     *
     * @param config - the configuration of the cache
     */
    function InMemoryCache(config) {
        var _this = this;
        var cacheConfig = config ? Object.assign({}, Utils_1.defaultConfig, config) : Utils_1.defaultConfig;
        _this = _super.call(this, cacheConfig) || this;
        logger.debug('now we start!');
        _this.cacheObj = new CacheObject();
        _this.cacheList = [];
        _this.curSizeInBytes = 0;
        _this.maxPriority = 5;
        // initialize list for every priority
        for (var i = 0; i < _this.maxPriority; i += 1) {
            _this.cacheList[i] = new Utils_1.CacheList();
        }
        return _this;
    }
    /**
     * decrease current size of the cache
     *
     * @param amount - the amount of the cache size which needs to be decreased
     */
    InMemoryCache.prototype._decreaseCurSizeInBytes = function (amount) {
        this.curSizeInBytes -= amount;
    };
    /**
     * increase current size of the cache
     *
     * @param amount - the amount of the cache szie which need to be increased
     */
    InMemoryCache.prototype._increaseCurSizeInBytes = function (amount) {
        this.curSizeInBytes += amount;
    };
    /**
     * check wether item is expired
     *
     * @param key - the key of the item
     *
     * @return true if the item is expired.
     */
    InMemoryCache.prototype._isExpired = function (key) {
        var text = this.cacheObj.getItem(key);
        var item = JSON.parse(text);
        if (Utils_1.getCurrTime() >= item.expires) {
            return true;
        }
        return false;
    };
    /**
     * delete item from cache
     *
     * @param prefixedKey - the key of the item
     * @param listIdx - indicates which cache list the key belongs to
     */
    InMemoryCache.prototype._removeItem = function (prefixedKey, listIdx) {
        // delete the key from the list
        this.cacheList[listIdx].removeItem(prefixedKey);
        // decrease the current size of the cache
        this._decreaseCurSizeInBytes(JSON.parse(this.cacheObj.getItem(prefixedKey)).byteSize);
        // finally remove the item from memory
        this.cacheObj.removeItem(prefixedKey);
    };
    /**
     * put item into cache
     *
     * @param prefixedKey - the key of the item
     * @param itemData - the value of the item
     * @param itemSizeInBytes - the byte size of the item
     * @param listIdx - indicates which cache list the key belongs to
     */
    InMemoryCache.prototype._setItem = function (prefixedKey, item, listIdx) {
        // insert the key into the list
        this.cacheList[listIdx].insertItem(prefixedKey);
        // increase the current size of the cache
        this._increaseCurSizeInBytes(item.byteSize);
        // finally add the item into memory
        this.cacheObj.setItem(prefixedKey, JSON.stringify(item));
    };
    /**
     * see whether cache is full
     *
     * @param itemSize
     *
     * @return true if cache is full
     */
    InMemoryCache.prototype._isCacheFull = function (itemSize) {
        return this.curSizeInBytes + itemSize > this.config.capacityInBytes;
    };
    /**
     * check whether the cache contains the key
     *
     * @param key
     */
    InMemoryCache.prototype.containsKey = function (key) {
        var prefixedKey = this.config.keyPrefix + key;
        for (var i = 0; i < this.maxPriority; i += 1) {
            if (this.cacheList[i].containsKey(prefixedKey)) {
                return i + 1;
            }
        }
        return -1;
    };
    /**
     * * Set item into cache. You can put number, string, boolean or object.
     * The cache will first check whether has the same key.
     * If it has, it will delete the old item and then put the new item in
     * The cache will pop out items if it is full
     * You can specify the cache item options. The cache will abort and output a warning:
     * If the key is invalid
     * If the size of the item exceeds itemMaxSize.
     * If the value is undefined
     * If incorrect cache item configuration
     * If error happened with browser storage
     *
     * @param key - the key of the item
     * @param value - the value of the item
     * @param options - optional, the specified meta-data
     *
     * @throws if the item is too big which exceeds the limit of single item size
     * @throws if the key is invalid
     */
    InMemoryCache.prototype.setItem = function (key, value, options) {
        var prefixedKey = this.config.keyPrefix + key;
        // invalid keys
        if (prefixedKey === this.config.keyPrefix || prefixedKey === this.cacheCurSizeKey) {
            logger.warn("Invalid key: should not be empty or 'CurSize'");
            return;
        }
        if ((typeof value) === 'undefined') {
            logger.warn("The value of item should not be undefined!");
            return;
        }
        var cacheItemOptions = {
            priority: options && options.priority !== undefined ? options.priority : this.config.defaultPriority,
            expires: options && options.expires !== undefined ?
                options.expires : (this.config.defaultTTL + Utils_1.getCurrTime())
        };
        if (cacheItemOptions.priority < 1 || cacheItemOptions.priority > 5) {
            logger.warn("Invalid parameter: priority due to out or range. It should be within 1 and 5.");
            return;
        }
        var item = this.fillCacheItem(prefixedKey, value, cacheItemOptions);
        // check wether this item is too big;
        if (item.byteSize > this.config.itemMaxSize) {
            logger.warn("Item with key: " + key + " you are trying to put into is too big!");
            return;
        }
        // if key already in the cache, then delete it.
        var presentKeyPrio = this.containsKey(key);
        if (presentKeyPrio !== -1) {
            this._removeItem(prefixedKey, presentKeyPrio - 1);
        }
        // pop out items in the cache when cache is full based on LRU
        // first start from lowest priority cache list
        var cacheListIdx = this.maxPriority - 1;
        while (this._isCacheFull(item.byteSize) && cacheListIdx >= 0) {
            if (!this.cacheList[cacheListIdx].isEmpty()) {
                var popedItemKey = this.cacheList[cacheListIdx].getLastItem();
                this._removeItem(popedItemKey, cacheListIdx);
            }
            else {
                cacheListIdx -= 1;
            }
        }
        this._setItem(prefixedKey, item, Number(item.priority) - 1);
    };
    /**
     * Get item from cache. It will return null if item doesn’t exist or it has been expired.
     * If you specified callback function in the options,
     * then the function will be executed if no such item in the cache
     * and finally put the return value into cache.
     * Please make sure the callback function will return the value you want to put into the cache.
     * The cache will abort output a warning:
     * If the key is invalid
     *
     * @param key - the key of the item
     * @param options - the options of callback function
     */
    InMemoryCache.prototype.getItem = function (key, options) {
        var ret = null;
        var prefixedKey = this.config.keyPrefix + key;
        if (prefixedKey === this.config.keyPrefix || prefixedKey === this.cacheCurSizeKey) {
            logger.warn("Invalid key: should not be empty or 'CurSize'");
            return null;
        }
        // check whether it's in the cachelist
        var presentKeyPrio = this.containsKey(key);
        if (presentKeyPrio !== -1) {
            if (this._isExpired(prefixedKey)) {
                // if expired, remove that item and return null
                this._removeItem(prefixedKey, presentKeyPrio - 1);
            }
            else {
                // if not expired, great, return the value and refresh it
                ret = this.cacheObj.getItem(prefixedKey);
                var item = JSON.parse(ret);
                this.cacheList[item.priority - 1].refresh(prefixedKey);
                return item.data;
            }
        }
        if (options && options.callback !== undefined) {
            var val = options.callback();
            if (val !== null) {
                this.setItem(key, val, options);
            }
            return val;
        }
        return null;
    };
    /**
     * remove item from the cache
     *
     * @param key - the key of the item
     */
    InMemoryCache.prototype.removeItem = function (key) {
        var prefixedKey = this.config.keyPrefix + key;
        // check if the key is in the cache
        var presentKeyPrio = this.containsKey(key);
        if (presentKeyPrio !== -1) {
            this._removeItem(prefixedKey, presentKeyPrio - 1);
        }
    };
    /**
     * clear the entire cache
     */
    InMemoryCache.prototype.clear = function () {
        for (var i = 0; i < this.maxPriority; i += 1) {
            for (var _i = 0, _a = this.cacheList[i].getKeys(); _i < _a.length; _i++) {
                var key = _a[_i];
                this._removeItem(key, i);
            }
        }
    };
    /**
     * Return all the keys in the cache.
     */
    InMemoryCache.prototype.getAllKeys = function () {
        var keys = [];
        for (var i = 0; i < this.maxPriority; i += 1) {
            for (var _i = 0, _a = this.cacheList[i].getKeys(); _i < _a.length; _i++) {
                var key = _a[_i];
                keys.push(key.substring(this.config.keyPrefix.length));
            }
        }
        return keys;
    };
    /**
     * return the current size of the cache
     *
     * @return the current size of the cache
     */
    InMemoryCache.prototype.getCacheCurSize = function () {
        return this.curSizeInBytes;
    };
    /**
     * Return a new instance of cache with customized configuration.
     * @param config - the customized configuration
     */
    InMemoryCache.prototype.createInstance = function (config) {
        return new InMemoryCache(config);
    };
    return InMemoryCache;
}(StorageCache_1.default));
exports.InMemoryCache = InMemoryCache;
var instance = new InMemoryCache();
exports.default = instance;
//# sourceMappingURL=InMemoryCache.js.map