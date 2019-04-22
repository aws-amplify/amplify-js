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

import AnalyticsClass from './Analytics';
import { AnalyticsProvider } from './types';

import Amplify, {
    ConsoleLogger as Logger,
    Hub,
    Linking,
    Platform
} from '@aws-amplify/core';

const logger = new Logger('Analytics');
let endpointUpdated = false;
let authConfigured = false;
let analyticsConfigured = false;

let _instance: AnalyticsClass = null;

if (!_instance) {
    logger.debug('Create Analytics Instance');
    _instance = new AnalyticsClass();
}

const Analytics = _instance;
Amplify.register(Analytics);

export default Analytics;
export { AnalyticsProvider };
export { AnalyticsClass };
export * from './Providers';

const listener = (capsule) => {
    const { channel, payload, source } = capsule;
    logger.debug('on hub capsule ' + channel, payload);

    switch(channel) {
        case 'auth':
            authEvent(payload);
            break;
        case 'storage':
            storageEvent(payload);
            break;
        case 'analytics':
            analyticsEvent(payload);
            break;
        default:
            break;
    }
};

const storageEvent = (payload) => {
    const { data: { attrs, metrics }} = payload;
    if (!attrs) return;

    Analytics.record({
        name: 'Storage', 
        attributes: attrs, 
        metrics
    });
};

const authEvent = (payload) => {
    const { event } = payload;
    if (!event) { return; }

    switch(event) {
        case 'signIn':
            Analytics.record({
                name: '_userauth.sign_in'
            });
            break;
        case 'signUp':
            Analytics.record({
                name: '_userauth.sign_up'
            });
            break;
        case 'signOut':
            break;
        case 'signIn_failure':
            Analytics.record({
                name: '_userauth.auth_fail'
            });
            break;
        case 'configured':
            authConfigured = true;
            if (authConfigured && analyticsConfigured) {
                sendEvents();
            }
            break;
    }
};

const analyticsEvent = (payload) => {
    const { event } = payload;
    if (!event) return;

     switch(event) {
         case 'pinpointProvider_configured':
            analyticsConfigured = true;
            if (authConfigured && analyticsConfigured) {
                sendEvents();
            }
            break;
     }
};

const sendEvents = () => {
    const config = Analytics.configure();
    if (!endpointUpdated && config['autoSessionRecord']) {
        Analytics.updateEndpoint({ immediate: true }).catch(e => {
            logger.debug('Failed to update the endpoint', e);
        });
        endpointUpdated = true;
    }
    Analytics.autoTrack('session', {
        enable: config['autoSessionRecord']
    });
};

Hub.listen('auth', listener);
Hub.listen('storage', listener);
Hub.listen('analytics', listener);
