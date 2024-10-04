// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ListPaths } from '../types/credentials';

import { createAmplifyListLocationsHandler } from './createAmplifyListLocationsHandler';

export interface AuthConfigAdapter {
	listLocations: ListPaths;
}

export const createAmplifyAuthConfigAdapter = (): AuthConfigAdapter => {
	const listLocations = createAmplifyListLocationsHandler();

	return { listLocations };
};
