// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
let _instance: Storage = null;
const getInstance = () => {
	if (_instance) {
		return _instance;
	}
	loggerStorageInstance.debug('Create Storage Instance, debug');
	_instance = new Storage();
	_instance.vault = new Storage();

	const old_configure = _instance.configure;
	_instance.configure = options => {
		loggerStorageInstance.debug('storage configure called');
		const vaultConfig = { ...old_configure.call(_instance, options) };

		// set level private for each provider for the vault
		Object.keys(vaultConfig).forEach(providerName => {
			if (typeof vaultConfig[providerName] !== 'string') {
				vaultConfig[providerName] = {
					...vaultConfig[providerName],
					level: 'private',
				};
			}
		});
		loggerStorageInstance.debug('storage vault configure called');
		_instance.vault.configure(vaultConfig);
	};
	return _instance;
};

export const StorageInstance: Storage = getInstance();
Amplify.register(StorageInstance);
