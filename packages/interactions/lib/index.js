'use strict';
function __export(m) {
	for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, '__esModule', { value: true });
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
var Interactions_1 = require('./Interactions');
exports.InteractionsClass = Interactions_1.default;
var core_1 = require('@aws-amplify/core');
var logger = new core_1.ConsoleLogger('Interactions');
var _instance = null;
if (!_instance) {
	logger.debug('Create Interactions Instance');
	_instance = new Interactions_1.default(null);
}
var Interactions = _instance;
core_1.default.register(Interactions);
exports.default = Interactions;
__export(require('./Providers/AWSLexProvider'));
//# sourceMappingURL=index.js.map
