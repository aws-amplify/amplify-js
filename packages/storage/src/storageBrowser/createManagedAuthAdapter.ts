// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CredentialsProvider, StorageBrowserConfigAdapter } from './types';

import { createListLocationsHandler } from './createListLocationsHandler';
import { createLocationCredentialsHandler } from './createLocationCredentialsHandler';

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
