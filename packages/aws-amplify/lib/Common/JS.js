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
Object.defineProperty(exports, "__esModule", { value: true });
var MIME_MAP = [
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
var JS = /** @class */ (function () {
    function JS() {
    }
    JS.isEmpty = function (obj) {
        return Object.keys(obj).length === 0;
    };
    JS.sortByField = function (list, field, dir) {
        if (!list || !list.sort) {
            return false;
        }
        var dirX = (dir && dir === 'desc') ? -1 : 1;
        list.sort(function (a, b) {
            var a_val = a[field];
            var b_val = b[field];
            if (typeof b_val === 'undefined') {
                return (typeof a_val === 'undefined') ? 0 : 1 * dirX;
            }
            if (typeof a_val === 'undefined') {
                return -1 * dirX;
            }
            if (a_val < b_val) {
                return -1 * dirX;
            }
            if (a_val > b_val) {
                return 1 * dirX;
            }
            return 0;
        });
        return true;
    };
    JS.objectLessAttributes = function (obj, less) {
        var ret = Object.assign({}, obj);
        if (less) {
            if (typeof less === 'string') {
                delete ret[less];
            }
            else {
                less.forEach(function (attr) {
                    delete ret[attr];
                });
            }
        }
        return ret;
    };
    JS.filenameToContentType = function (filename, defVal) {
        if (defVal === void 0) { defVal = 'application/octet-stream'; }
        var name = filename.toLowerCase();
        var filtered = MIME_MAP.filter(function (mime) { return name.endsWith('.' + mime.ext); });
        return filtered.length > 0 ? filtered[0].type : defVal;
    };
    JS.isTextFile = function (contentType) {
        var type = contentType.toLowerCase();
        if (type.startsWith('text/')) {
            return true;
        }
        return ('application/json' === type ||
            'application/xml' === type ||
            'application/sh' === type);
    };
    /**
     * generate random string
     */
    JS.generateRandomString = function () {
        var result = '';
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 32; i > 0; i -= 1) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    };
    JS.makeQuerablePromise = function (promise) {
        if (promise.isResolved)
            return promise;
        var isPending = true;
        var isRejected = false;
        var isFullfilled = false;
        var result = promise.then(function (data) {
            isFullfilled = true;
            isPending = false;
            return data;
        }, function (e) {
            isRejected = true;
            isPending = false;
            throw e;
        });
        result.isFullfilled = function () { return isFullfilled; };
        result.isPending = function () { return isPending; };
        result.isRejected = function () { return isRejected; };
        return result;
    };
    return JS;
}());
exports.default = JS;
//# sourceMappingURL=JS.js.map