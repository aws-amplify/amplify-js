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
var JS = (function () {
    function JS() {
    }
    JS.isEmpty = function (obj) {
        return Object.keys(obj).length === 0;
    };
    JS.sortByField = function (list, field, dir) {
        if (!list || !list.sort) {
            return;
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
        ;
        if (name.endsWith('.txt')) {
            return 'text/plain';
        }
        else if (name.endsWith('.html')) {
            return 'text/html';
        }
        else if (name.endsWith('.js')) {
            return 'text/javascript';
        }
        else if (name.endsWith('.css')) {
            return 'text/css';
        }
        else if (name.endsWith('.csv')) {
            return 'text/csv';
        }
        else if (name.endsWith('.yml') || name.endsWith('.yaml')) {
            return 'text/yaml';
        }
        else if (name.endsWith('.ics') || name.endsWith('.ical')) {
            return 'text/calendar';
        }
        if (name.endsWith('.png')) {
            return 'image/png';
        }
        else if (name.endsWith('.gif')) {
            return 'image/gif';
        }
        else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
            return 'image/jpeg';
        }
        else if (name.endsWith('.bmp')) {
            return 'image/bmp';
        }
        else if (name.endsWith('.ico')) {
            return 'image/x-icon';
        }
        else if (name.endsWith('.tif') || name.endsWith('.tiff')) {
            return 'image/tiff';
        }
        else if (name.endsWith('.svg')) {
            return 'image/svg+xml';
        }
        if (name.endsWith('.json')) {
            return 'application/json';
        }
        else if (name.endsWith('.xml')) {
            return 'application/xml';
        }
        else if (name.endsWith('.sh')) {
            return 'application/x-sh';
        }
        else if (name.endsWith('.zip')) {
            return 'application/zip';
        }
        else if (name.endsWith('.rar')) {
            return 'application/x-rar-compressed';
        }
        else if (name.endsWith('.tar')) {
            return 'application/x-tar';
        }
        else if (name.endsWith('.bz')) {
            return 'application/x-bzip';
        }
        else if (name.endsWith('.bz2')) {
            return 'application/x-bzip2';
        }
        else if (name.endsWith('.pdf')) {
            return 'application/pdf';
        }
        else if (name.endsWith('.jar')) {
            return 'application/java-archive';
        }
        else if (name.endsWith('.doc')) {
            return 'application/msword';
        }
        else if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
            return 'application/vnd.ms-excel';
        }
        if (name.endsWith('.eml')) {
            return 'message/rfc822';
        }
        return defVal;
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
    return JS;
}());
exports.default = JS;
//# sourceMappingURL=JS.js.map