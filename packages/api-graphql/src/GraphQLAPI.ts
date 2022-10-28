// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	_ensureCredentials() {
		return this.Credentials.get()
			.then(credentials => {
				if (!credentials) return false;
				const cred = this.Credentials.shear(credentials);
				logger.debug('set credentials for api', cred);

				return true;
			})
			.catch(err => {
				logger.warn('ensure credentials error', err);
				return false;
			});
	}
}

export const GraphQLAPI = new GraphQLAPIClass(null);
Amplify.register(GraphQLAPI);
