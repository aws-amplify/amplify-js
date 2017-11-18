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

import I18nClass from './I18n';

import { ConsoleLogger as Logger } from '../Common';

const logger = new Logger('I18n');

let _instance = null;

console.log('Load I18n module');
if (!_instance) {
    logger.debug('Create I18n Instance');
    _instance = new I18nClass();
}

export default I18n = _instance;
