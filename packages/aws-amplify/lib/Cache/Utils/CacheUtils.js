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
/**
* Default cache config
*/
exports.defaultConfig = {
    keyPrefix: 'aws-amplify-cache',
    capacityInBytes: 1048576,
    itemMaxSize: 210000,
    defaultTTL: 259200000,
    defaultPriority: 5,
    warningThreshold: 0.8,
    storage: (typeof window === 'undefined') ? null : window.localStorage
};
/**
 * return the byte size of the string
 * @param str
 */
function getByteLength(str) {
    var ret = 0;
    ret = str.length;
    for (var i = str.length; i >= 0; i -= 1) {
        var charCode = str.charCodeAt(i);
        if (charCode > 0x7f && charCode <= 0x7ff) {
            ret += 1;
        }
        else if (charCode > 0x7ff && charCode <= 0xffff) {
            ret += 2;
        }
        // trail surrogate
        if (charCode >= 0xDC00 && charCode <= 0xDFFF) {
            i -= 1;
        }
    }
    return ret;
}
exports.getByteLength = getByteLength;
/**
 * get current time
 */
function getCurrTime() {
    var currTime = new Date();
    return currTime.getTime();
}
exports.getCurrTime = getCurrTime;
/**
 * check if passed value is an integer
 */
function isInteger(value) {
    if (Number.isInteger) {
        return Number.isInteger(value);
    }
    return _isInteger(value);
}
exports.isInteger = isInteger;
function _isInteger(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}
//# sourceMappingURL=CacheUtils.js.map