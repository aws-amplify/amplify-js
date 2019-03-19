/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import PubSubClass from './PubSub';

import Amplify, { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('PubSub');

let _instance: PubSubClass = null;

if (!_instance) {
    logger.debug('Create PubSub Instance');
    _instance = new PubSubClass(null);
}

const PubSub = _instance;
Amplify.register(PubSub);

export default PubSub;

export * from './Providers/AWSIotProvider';
export { PubSubClass };
