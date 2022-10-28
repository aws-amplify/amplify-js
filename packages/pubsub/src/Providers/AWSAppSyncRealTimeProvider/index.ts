// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	_ensureCredentials() {
		return Credentials.get()
			.then((credentials: any) => {
				if (!credentials) return false;
				const cred = Credentials.shear(credentials);
				logger.debug('set credentials for AWSAppSyncRealTimeProvider', cred);

				return true;
			})
			.catch((err: any) => {
				logger.warn('ensure credentials error', err);
				return false;
			});
	}
}
