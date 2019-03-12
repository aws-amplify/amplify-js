/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import {
    ConsoleLogger as Logger
} from '@aws-amplify/core';
const logger = new Logger('urlListener');

let linkingHandlers = [];

export default async callback => {
    let Linking: any;

    try {
        ({ Linking } = require('react-native'));
    } catch (error) { /* Keep webpack happy */ }

    const handler = ({ url, ...rest }: { url: string }) => {
        logger.debug('addEventListener', { url, ...rest });
        callback({ url });
    };
    linkingHandlers.forEach(lh => Linking.removeEventListener('url', lh));
    Linking.addEventListener('url', handler);
    linkingHandlers = [handler];

    const initialUrl = await Linking.getInitialURL();
    logger.debug('before callback', { initialUrl });
    callback({ url: initialUrl });
};
