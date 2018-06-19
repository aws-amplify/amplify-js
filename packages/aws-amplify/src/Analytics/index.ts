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

import {
    ConsoleLogger as Logger,
    Hub,
    Linking,
    AppState,
    Amplify
} from '../Common';
import Platform from '../Common/Platform';

const logger = new Logger('Analytics');
let startsessionRecorded = false;
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

// listen on app state change
const dispatchAppStateEvent = (event, data) => {
    Hub.dispatch('appState', { event, data }, 'AppState');
};

if (Platform.isReactNative) {
    AppState.addEventListener('change', (nextAppState) => {
        switch(nextAppState) {
            case 'active':
                dispatchAppStateEvent('active', {});
        }
    });
}

// send a session start event if autoSessionRecord is enabled
const autoSessionRecord = () => {
    const config = Analytics.configure();
    startsessionRecorded = true;
    if (config.autoSessionRecord) {
        Analytics.updateEndpoint({}).then(() => {
            Analytics.startSession().catch(e => {
                logger.debug('start Session error', e);
            });
        });
    } else {
        logger.debug('auto Session record is diasabled');
    }            
};

Analytics.onHubCapsule = (capsule) => {
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
    const { attrs, metrics } = payload;
    if (!attrs) return;

    Analytics.record('Storage', attrs, metrics);
};

const authEvent = (payload) => {
    const { event } = payload;
    if (!event) { return; }

    switch(event) {
        case 'signIn':
            Analytics.record('_userauth.sign_in');
            break;
        case 'signUp':
            Analytics.record('_userauth.sign_up');
            break;
        case 'signOut':
            break;
        case 'signIn_failure':
            Analytics.record('_userauth.auth_fail');
            break;
        case 'configured':
            authConfigured = true;
            if (authConfigured && analyticsConfigured && !startsessionRecorded) {
                autoSessionRecord();
            }
            break;
    }
};

const analyticsEvent = (payload) => {
    const { event } = payload;
    if (!event) return;

     switch(event) {
         case 'configured':
            analyticsConfigured = true;
            if (authConfigured && analyticsConfigured && !startsessionRecorded) {
                autoSessionRecord();
            }
            break;
     }
};

Hub.listen('auth', Analytics);
Hub.listen('storage', Analytics);
Hub.listen('analytics', Analytics);
