/* eslint-disable unused-imports/no-unused-vars */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	CredentialsProvider,
	ListLocationsHandler,
	LocationCredentialsHandler,
} from '../types';

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
		listLocations: ListLocationsHandler;
		getLocationCredentials: LocationCredentialsHandler;
	};
	region: string;
}

export const createManagedAuthAdapter = (
	// eslint-disable-next-line unused-imports/no-unused-vars
	{ credentialsProvider, region, accountId }: CreateManagedAuthAdapterInput,
): ManagedAuthAdaptor => {
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
