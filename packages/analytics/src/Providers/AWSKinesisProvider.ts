// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	private _getCredentials() {
		return Credentials.get()
			.then(credentials => {
				if (!credentials) return null;
				logger.debug('set credentials for analytics', this._config.credentials);
				return Credentials.shear(credentials);
			})
			.catch(err => {
				logger.debug('ensure credentials error', err);
				return null;
			});
	}
}
