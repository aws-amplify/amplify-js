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
	input: CreateListLocationsHandlerInput,
): ListLocations => {
	return async (handlerInput = {}) => {
		const { nextToken, pageSize } = handlerInput;
		const { locations, nextToken: newNextToken } = await listCallerAccessGrants(
			{
				accountId: input.accountId,
				credentialsProvider: input.credentialsProvider,
				region: input.region,
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
