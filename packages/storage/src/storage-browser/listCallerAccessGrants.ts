// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AccessGrant, CredentialsProvider, ListLocationsOutput } from './types';

export interface ListCallerAccessGrantsInput {
	accountId: string;
	credentialsProvider: CredentialsProvider;
	region: string;
	options?: {
		nextToken?: string;
		// Default to 100; If > 1000, API will make multiple API calls.
		pageSize?: number;
	};
}

export type ListCallerAccessGrantsOutput = ListLocationsOutput<AccessGrant>;

export const listCallerAccessGrants = (
	// eslint-disable-next-line unused-imports/no-unused-vars
	input: ListCallerAccessGrantsInput,
): Promise<ListCallerAccessGrantsOutput> => {
	// TODO(@AllanZhengYP)
	throw new Error('Not Implemented');
};
