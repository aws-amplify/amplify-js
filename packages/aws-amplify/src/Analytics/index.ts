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

import {
    ConsoleLogger as Logger,
    Hub
} from '../Common';

const logger = new Logger('Analytics');

let _instance = null;

if (!_instance) {
    logger.debug('Create Analytics Instance');
    _instance = new AnalyticsClass(null);
}

const Analytics = _instance;
export default Analytics;

Analytics.onHubCapsule = (capsule) => {
    const { channel, payload, source } = capsule;
    logger.debug('on hub capsule ' + channel, payload);

    switch(name) {
        case 'auth':
            authEvent(payload);
            break;
    }
}

const authEvent = (payload) => {
    const { event } = payload;
    if (!event) { return; }

    switch(event) {
        case 'signIn':
            Analytics.restart();
            Analytics.record('_userauth.sign_in');
            break;
        case 'signUp':
            Analytics.record('_userauth.sign_up');
            break;
        case 'signOut':
            Analytics.restart();
            break;
        case 'signIn_failure':
            Analytics.record('_userauth.auth_fail');
            break;
    }
}

Hub.listen('auth', Analytics);
