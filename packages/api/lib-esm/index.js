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
import APIClass, { graphqlOperation } from './API';
import { GRAPHQL_AUTH_MODE } from './types';
import Amplify, { ConsoleLogger as Logger } from '@aws-amplify/core';
var logger = new Logger('API');
var _instance = null;
if (!_instance) {
	logger.debug('Create API Instance');
	_instance = new APIClass(null);
}
var API = _instance;
Amplify.register(API);
export default API;
export { APIClass, graphqlOperation, GRAPHQL_AUTH_MODE };
//# sourceMappingURL=index.js.map
