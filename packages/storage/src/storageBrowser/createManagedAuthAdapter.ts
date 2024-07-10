// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	CredentialsProvider,
	GetLocationCredentials,
	ListLocations,
} from './types';

import { createListLocationsHandler } from './createListLocationsHandler';
import { createLocationCredentialsHandler } from './createLocationCredentialsHandler';
import { credentialsCachingDecorator } from './credentialsCachingDecorator';

export interface CreateManagedAuthAdapterInput {
	accountId: string;
	region: string;
	credentialsProvider: CredentialsProvider;
}

export interface ManagedAuthAdaptor {
	getHandlers(): {
		listLocations: ListLocations;
		getLocationCredentials: GetLocationCredentials;
	};
	region: string;
}

export const createManagedAuthAdapter = ({
	credentialsProvider,
	region,
	accountId,
}: CreateManagedAuthAdapterInput): ManagedAuthAdaptor => {
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
