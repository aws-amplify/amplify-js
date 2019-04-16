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

const MIME_MAP = [
    { type: 'text/plain', ext: 'txt' },
    { type: 'text/html', ext: 'html' },
    { type: 'text/javascript', ext: 'js' },
    { type: 'text/css', ext: 'css' },
    { type: 'text/csv', ext: 'csv' },
    { type: 'text/yaml', ext: 'yml' },
    { type: 'text/yaml', ext: 'yaml' },
    { type: 'text/calendar', ext: 'ics' },
    { type: 'text/calendar', ext: 'ical' },

    { type: 'image/png', ext: 'png' },
    { type: 'image/gif', ext: 'gif' },
    { type: 'image/jpeg', ext: 'jpg' },
    { type: 'image/jpeg', ext: 'jpeg' },
    { type: 'image/bmp', ext: 'bmp' },
    { type: 'image/x-icon', ext: 'ico' },
    { type: 'image/tiff', ext: 'tif' },
    { type: 'image/tiff', ext: 'tiff' },
    { type: 'image/svg+xml', ext: 'svg' },

    { type: 'application/json', ext: 'json' },
    { type: 'application/xml', ext: 'xml' },
    { type: 'application/x-sh', ext: 'sh' },
    { type: 'application/zip', ext: 'zip' },
    { type: 'application/x-rar-compressed', ext: 'rar' },
    { type: 'application/x-tar', ext: 'tar' },
    { type: 'application/x-bzip', ext: 'bz' },
    { type: 'application/x-bzip2', ext: 'bz2' },
    { type: 'application/pdf', ext: 'pdf' },
    { type: 'application/java-archive', ext: 'jar' },
    { type: 'application/msword', ext: 'doc' },
    { type: 'application/vnd.ms-excel', ext: 'xls' },
    { type: 'application/vnd.ms-excel', ext: 'xlsx' },

    { type: 'message/rfc822', ext: 'eml' }
];

export default class JS {
    static isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    static sortByField(list, field, dir) {
        if (!list || !list.sort) { return false; }

        const dirX = (dir && dir === 'desc')? -1 : 1;
        list.sort(function(a, b) {
            const a_val = a[field];
            const b_val = b[field];

            if (typeof b_val === 'undefined') {
                return (typeof a_val === 'undefined')? 0 : 1 * dirX;
            }

            if (typeof a_val === 'undefined') {
                return -1 * dirX;
            }

            if (a_val < b_val) { return -1 * dirX; }
            if (a_val > b_val) { return 1 * dirX; }

            return 0;
        });

        return true;
    }

    static objectLessAttributes(obj, less) {
        const ret = Object.assign({}, obj);
        if (less) {
            if (typeof less === 'string') {
                delete ret[less];
            } else {
                less.forEach(attr => {
                    delete ret[attr];
                });
            }
        }

        return ret;
    }

    static filenameToContentType(filename, defVal='application/octet-stream') {
        const name = filename.toLowerCase();

        const filtered = MIME_MAP.filter(mime => name.endsWith('.' + mime.ext));
        return filtered.length > 0? filtered[0].type : defVal;
    }

    static isTextFile(contentType) {
        const type = contentType.toLowerCase();
        if (type.startsWith('text/')) { return true; }
        return ('application/json' === type ||
                'application/xml' === type ||
                'application/sh' === type);
    }

    /**
     * generate random string
     */
    static generateRandomString() {
        let result = '';
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    	for (let i = 32; i > 0; i -= 1) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
    	return result;
    }

    static makeQuerablePromise(promise) {
        if (promise.isResolved) return promise;

        let isPending = true;
        let isRejected = false;
        let isFullfilled = false;

        const result = promise.then(
            (data) => {
                isFullfilled = true;
                isPending = false;
                return data;
            },
            (e) => {
                isRejected = true;
                isPending = false;
                throw e;
            }
        );

        result.isFullfilled = () => { return isFullfilled; };
        result.isPending = () => { return isPending; };
        result.isRejected = () => { return isRejected; };

        return result;
    }

    static browserOrNode() {
        const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
        const isNode =
            typeof process !== 'undefined' &&
            process.versions != null &&
            process.versions.node != null;

        return {
            isBrowser,
            isNode
        };
    }

    /**
     * transfer the first letter of the keys to lowercase
     * @param {Object} obj - the object need to be transferred
     * @param {Array} whiteListForItself - whitelist itself from being transferred
     * @param {Array} whiteListForChildren - whitelist its children keys from being transferred
     */
    static transferKeyToLowerCase(obj, whiteListForItself=[], whiteListForChildren=[]) {
       if (!JS.isStrictObject(obj)) return obj;
        const ret = {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const transferedKey = whiteListForItself.includes(key)? 
                    key : key[0].toLowerCase() + key.slice(1);

                ret[transferedKey] = whiteListForChildren.includes(key)?
                    obj[key] 
                    : 
                    JS.transferKeyToLowerCase(
                        obj[key], 
                        whiteListForItself, 
                        whiteListForChildren
                    );
            }
        }
        
        return ret;
    }

    /**
     * transfer the first letter of the keys to lowercase
     * @param {Object} obj - the object need to be transferred
     * @param {Array} whiteListForItself - whitelist itself from being transferred
     * @param {Array} whiteListForChildren - whitelist its children keys from being transferred
     */
    static transferKeyToUpperCase(obj, whiteListForItself=[], whiteListForChildren=[]) {
        if (!JS.isStrictObject(obj)) return obj;
        const ret = {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const transferedKey = whiteListForItself.includes(key)? 
                    key : key[0].toUpperCase() + key.slice(1);

                ret[transferedKey] = whiteListForChildren.includes(key)?
                    obj[key] 
                    : 
                    JS.transferKeyToUpperCase(
                        obj[key], 
                        whiteListForItself, 
                        whiteListForChildren
                    );
            }
        }
        
        return ret;
    }

    /**
     * Return true if the object is a strict object
     * which means it's not Array, Function, Number, String, Boolean or Null
     * @param obj the Object
     */
    static isStrictObject(obj) { 
        return ((obj instanceof Object) && 
            !(obj instanceof Array) &&
            !(obj instanceof Function) &&
            !(obj instanceof Number) &&
            !(obj instanceof String) &&
            !(obj instanceof Boolean)
        );
    }
}
