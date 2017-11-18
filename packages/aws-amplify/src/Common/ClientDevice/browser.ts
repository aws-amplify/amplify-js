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

import Hub from '../Hub';
import { ConsoleLogger as Logger } from '../Logger';

const logger = new Logger('ClientDevice_Browser');

export function clientInfo() {
    if (typeof window == 'undefined') { return {} }

    return browserClientInfo();
}

function browserClientInfo() {
    if (typeof window === 'undefined') {
        logger.warn('No window object available to get browser client info');
        return {};
    }

    const nav = window.navigator;
    if (!nav) {
        logger.warn('No navigator object available to get browser client info');
        return {};
    }

    const { platform, product, vendor, userAgent, language } = nav;
    const type = browserType(userAgent);
    const timezone = browserTimezone();

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

export function dimension() {
    if (typeof window === 'undefined') {
        logger.warn('No window object available to get browser client info');
        return { width: 320, height: 320 };
    }

    return {
        width: window.innerWidth,
        height: window.innerHeight
    }
}

function browserTimezone() {
    const tz_match = /.+\(([A-Z]+)\)/.exec(new Date().toString());
    return tz_match? tz_match[1] : '';
}

function browserType(userAgent) {
    const opera_match = /.+(Opera[\s[A-Z]*|OPR[\sA-Z]*)\/([0-9\.]+).*/i.exec(userAgent);
    if (opera_match) { return { type: opera_match[1], version: opera_match[2]}; }

    const cf_match = /.+(Chrome|Firefox|FxiOS)\/([0-9\.]+).*/i.exec(userAgent);
    if (cf_match) { return { type: cf_match[1], version: cf_match[2]}; }

    const ie_match = /.+(Trident|Edge)\/([0-9\.]+).*/i.exec(userAgent);
    if (ie_match) { return { type: ie_match[1], version: ie_match[2]}; }

    const s_match = /.+(Safari)\/([0-9\.]+).*/i.exec(userAgent);
    if (s_match) { return { type: s_match[1], version: s_match[2]}; }

    const awk_match = /.+(AppleWebKit)\/([0-9\.]+).*/i.exec(userAgent);
    if (awk_match) { return { type: awk_match[1], version: awk_match[2]}; }

    const any_match = /.*([A-Z]+)\/([0-9\.]+).*/i.exec(userAgent);
    if (any_match) { return { type: any_match[1], version: any_match[2]}; }

    return { type: '', version: '' };
}

if (typeof window !== 'undefined') {
    window.addEventListener('resize', function() {
        Hub.dispatch('window', { event: 'resize' }, 'DeviceInfo');
    });
}
