// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CredentialsProvider, ListLocations } from '../types/credentials';
import { _listCallerAccessGrants } from '../apis/_listCallerAccessGrants';

interface CreateListLocationsHandlerInput {
	accountId: string;
	credentialsProvider: CredentialsProvider;
	region: string;
}

export const createListLocationsHandler = (
	handlerInput: CreateListLocationsHandlerInput,
): ListLocations => {
	return async function listLocations(input = {}) {
		const result = await _listCallerAccessGrants({ ...input, ...handlerInput });

		return result;
	};
};
