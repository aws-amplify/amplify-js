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
var __assign =
	(this && this.__assign) ||
	function() {
		__assign =
			Object.assign ||
			function(t) {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (var p in s)
						if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
				}
				return t;
			};
		return __assign.apply(this, arguments);
	};
import StorageClass from './Storage';
import Amplify, { ConsoleLogger as Logger } from '@aws-amplify/core';
var logger = new Logger('Storage');
var _instance = null;
if (!_instance) {
	logger.debug('Create Storage Instance');
	_instance = new StorageClass();
	_instance.vault = new StorageClass();
	var old_configure_1 = _instance.configure;
	_instance.configure = function(options) {
		logger.debug('storage configure called');
		var vaultConfig = __assign({}, old_configure_1.call(_instance, options));
		// set level private for each provider for the vault
		Object.keys(vaultConfig).forEach(function(providerName) {
			if (typeof vaultConfig[providerName] !== 'string') {
				vaultConfig[providerName] = __assign(
					__assign({}, vaultConfig[providerName]),
					{ level: 'private' }
				);
			}
		});
		logger.debug('storage vault configure called');
		_instance.vault.configure(vaultConfig);
	};
}
var Storage = _instance;
Amplify.register(Storage);
export default Storage;
export { StorageClass };
export * from './Providers';
//# sourceMappingURL=index.js.map
