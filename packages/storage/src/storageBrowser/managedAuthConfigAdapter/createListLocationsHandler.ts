// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CredentialsProvider, ListLocations } from '../types';
import { listCallerAccessGrants } from '../apis/listCallerAccessGrants';

interface CreateListLocationsHandlerInput {
	accountId: string;
	credentialsProvider: CredentialsProvider;
	region: string;
}

export const createListLocationsHandler = (
	handlerInput: CreateListLocationsHandlerInput,
): ListLocations => {
	return async function listLocations(input = {}) {
		const result = await listCallerAccessGrants({ ...input, ...handlerInput });

		return result;
	};
};
