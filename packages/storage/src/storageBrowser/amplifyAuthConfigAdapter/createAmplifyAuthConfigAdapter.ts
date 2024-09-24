// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';

import { GetLocationCredentials, ListLocations } from '../types';

export interface AuthConfigAdapter {
	/** outputs Scope(path), permission (read/write/readwrite), type(prefix/bucket/object) */
	listLocations: ListLocations;
	/** basically fetch auth session */
	getLocationCredentials?: GetLocationCredentials;
}

export const createAmplifyAuthConfigAdapter = (): AuthConfigAdapter => {
	const listLocations = createAmplifyListLocationsHandler();

	return { listLocations };
};

const createAmplifyListLocationsHandler = (): ListLocations => {
	// eslint-disable-next-line unused-imports/no-unused-vars
	return async function listLocations(input = {}) {
		const { Storage } = Amplify.getConfig();
		const { paths } = Storage!.S3!;

		// Parse Amplify storage buckets to get location

		return { locations: paths ?? [] };
	};
};
