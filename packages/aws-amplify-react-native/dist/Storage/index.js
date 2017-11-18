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

import StorageClass from './Storage';

import Hub from '../Common/Hub';
import { ConsoleLogger as Logger } from '../Common';

const logger = new Logger('Storage');

let _instance = null;

if (!_instance) {
    logger.debug('Create Storage Instance');
    _instance = new StorageClass();
    _instance.vault = new StorageClass({ level: 'private' });

    const _old_configure = _instance.configure;
    _instance.configure = options => {
        logger.debug('configure called');
        _old_configure.call(_instance, options);

        const vault_options = Object.assign({}, options, { level: 'private' });
        _instance.vault.configure(vault_options);
    };
}

export default Storage = _instance;

Storage.onHubCapsule = capsule => {
    const { channel, payload, source } = capsule;
    logger.debug('on hub capsule channel ' + channel);

    if (channel === 'credentials') {
        // TODO: update credentials
    }
};

Hub.listen('credentials', Storage);