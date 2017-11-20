'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.calcKey = calcKey;
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

function calcKey(file, fileToKey) {
    var name = file.name,
        size = file.size,
        type = file.type;

    var key = encodeURI(name);
    if (fileToKey) {
        var callback_type = typeof fileToKey === 'undefined' ? 'undefined' : _typeof(fileToKey);
        if (callback_type === 'string') {
            key = fileToKey;
        } else if (callback_type === 'function') {
            key = fileToKey({ name: name, size: size, type: type });
        } else {
            key = encodeURI(JSON.stringify(fileToKey));
        }
        if (!key) {
            key = 'empty_key';
        }
    }

    return key.replace(/\s/g, '_');
}