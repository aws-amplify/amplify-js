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
    return JS;
}());
exports.default = JS;
//# sourceMappingURL=JS.js.map