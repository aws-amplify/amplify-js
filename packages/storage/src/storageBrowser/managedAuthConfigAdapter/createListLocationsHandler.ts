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
	return async (input = {}) => {
		const { nextToken, pageSize } = input;
		const { locations, nextToken: newNextToken } = await listCallerAccessGrants(
			{
				accountId: handlerInput.accountId,
				credentialsProvider: handlerInput.credentialsProvider,
				region: handlerInput.region,
				pageSize,
				nextToken,
			},
		);

		return {
			locations,
			nextToken: newNextToken || undefined,
		};
	};
};
