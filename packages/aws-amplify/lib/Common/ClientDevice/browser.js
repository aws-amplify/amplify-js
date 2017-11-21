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
var Hub_1 = require("../Hub");
var Logger_1 = require("../Logger");
var logger = new Logger_1.ConsoleLogger('ClientDevice_Browser');
function clientInfo() {
    if (typeof window == 'undefined') {
        return {};
    }
    return browserClientInfo();
}
exports.clientInfo = clientInfo;
function browserClientInfo() {
    if (typeof window === 'undefined') {
        logger.warn('No window object available to get browser client info');
        return {};
    }
    var nav = window.navigator;
    if (!nav) {
        logger.warn('No navigator object available to get browser client info');
        return {};
    }
    var platform = nav.platform, product = nav.product, vendor = nav.vendor, userAgent = nav.userAgent, language = nav.language;
    var type = browserType(userAgent);
    var timezone = browserTimezone();
    return {
        platform: platform,
        make: product || vendor,
        model: type.type,
        version: type.version,
        appVersion: [type.type, type.version].join('/'),
        language: language,
        timezone: timezone
    };
}
function dimension() {
    if (typeof window === 'undefined') {
        logger.warn('No window object available to get browser client info');
        return { width: 320, height: 320 };
    }
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}
exports.dimension = dimension;
function browserTimezone() {
    var tz_match = /.+\(([A-Z]+)\)/.exec(new Date().toString());
    return tz_match ? tz_match[1] : '';
}
function browserType(userAgent) {
    var opera_match = /.+(Opera[\s[A-Z]*|OPR[\sA-Z]*)\/([0-9\.]+).*/i.exec(userAgent);
    if (opera_match) {
        return { type: opera_match[1], version: opera_match[2] };
    }
    var cf_match = /.+(Chrome|Firefox|FxiOS)\/([0-9\.]+).*/i.exec(userAgent);
    if (cf_match) {
        return { type: cf_match[1], version: cf_match[2] };
    }
    var ie_match = /.+(Trident|Edge)\/([0-9\.]+).*/i.exec(userAgent);
    if (ie_match) {
        return { type: ie_match[1], version: ie_match[2] };
    }
    var s_match = /.+(Safari)\/([0-9\.]+).*/i.exec(userAgent);
    if (s_match) {
        return { type: s_match[1], version: s_match[2] };
    }
    var awk_match = /.+(AppleWebKit)\/([0-9\.]+).*/i.exec(userAgent);
    if (awk_match) {
        return { type: awk_match[1], version: awk_match[2] };
    }
    var any_match = /.*([A-Z]+)\/([0-9\.]+).*/i.exec(userAgent);
    if (any_match) {
        return { type: any_match[1], version: any_match[2] };
    }
    return { type: '', version: '' };
}
if (typeof window !== 'undefined') {
    window.addEventListener('resize', function () {
        Hub_1.default.dispatch('window', { event: 'resize', data: dimension() }, 'DeviceInfo');
    });
    window.addEventListener('scroll', function () {
        var pos = { x: window.scrollX, y: window.scrollY };
        Hub_1.default.dispatch('window', { event: 'scroll', data: pos }, 'DeviceInfo');
    });
    window.addEventListener('offline', function () {
        Hub_1.default.dispatch('window', { event: 'offline' }, 'DeviceInfor');
    });
    window.addEventListener('online', function () {
        Hub_1.default.dispatch('window', { event: 'online' }, 'DeviceInfor');
    });
}
//# sourceMappingURL=browser.js.map