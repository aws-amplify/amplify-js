// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CredentialsProvider, StorageBrowserConfigAdapter } from './types';

import { createListLocationsHandler } from './createListLocationsHandler';
import { createLocationCredentialsHandler } from './createLocationCredentialsHandler';
import { credentialsCachingDecorator } from './credentialsCachingDecorator';

interface CreateManagedAuthAdapterInput {
	accountId: string;
	region: string;
	credentialsProvider: CredentialsProvider;
}

export const createManagedAuthAdapter = ({
	credentialsProvider,
	region,
	accountId,
}: CreateManagedAuthAdapterInput): StorageBrowserConfigAdapter => {
	return {
		getHandlers: () => {
			const credentialsProviderCaching =
				credentialsCachingDecorator(credentialsProvider);
			const listLocations = createListLocationsHandler({
				credentialsProvider: credentialsProviderCaching,
				accountId,
				region,
			});
			const getLocationCredentials = createLocationCredentialsHandler({
				credentialsProvider: credentialsProviderCaching,
				accountId,
				region,
			});

			return {
				listLocations,
				getLocationCredentials,
			};
		},
		region,
	};
};
