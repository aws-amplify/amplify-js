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
import Notification from './Notification';

import Hub from '../Common/Hub';
import { ConsoleLogger as Logger } from '../Common';

const logger = new Logger('Analytics');

let _instance = null;

if (!_instance) {
    logger.debug('Create Analytics Instance');
    _instance = new AnalyticsClass();
}

export default Analytics = _instance;

Analytics.onHubCapsule = capsule => {
    const { channel, payload, source } = capsule;
    logger.debug('on hub capsule channel ' + channel);

    if (channel === 'credentials') {
        Analytics.restart(payload);
    }
};

Hub.listen('credentials', Analytics);

export { Notification };