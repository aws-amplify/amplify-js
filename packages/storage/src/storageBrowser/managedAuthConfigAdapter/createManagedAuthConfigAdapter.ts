// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	CredentialsProvider,
	GetLocationCredentials,
	ListLocations,
} from '../types';

import { createListLocationsHandler } from './createListLocationsHandler';
import { createLocationCredentialsHandler } from './createLocationCredentialsHandler';

interface CreateManagedAuthConfigAdapterInput {
	accountId: string;
	region: string;
	credentialsProvider: CredentialsProvider;
}

interface AuthConfigAdapter {
	listLocations: ListLocations;
	getLocationCredentials: GetLocationCredentials;
	region: string;
}

/**
 * Create configuration including handlers to call S3 Access Grant APIs to list and get
 * credentials for different locations.
 *
 * @param options - Configuration options for the adapter.
 * @returns - An object containing the handlers to call S3 Access Grant APIs and region
 */
export const createManagedAuthConfigAdapter = ({
	credentialsProvider,
	region,
	accountId,
}: CreateManagedAuthConfigAdapterInput): AuthConfigAdapter => {
	const listLocations = createListLocationsHandler({
		credentialsProvider,
		accountId,
		region,
	});
	const getLocationCredentials = createLocationCredentialsHandler({
		credentialsProvider,
		accountId,
		region,
	});

	return {
		listLocations,
		getLocationCredentials,
		region,
	};
};
