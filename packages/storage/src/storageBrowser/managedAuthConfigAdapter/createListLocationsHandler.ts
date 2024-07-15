// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CredentialsProvider, ListLocations } from '../types';
import { logger } from '../../utils';

declare const listCallerAccessGrants: (config: any, input: any) => Promise<any>;

const MAX_PAGE_SIZE = 1000;

interface CreateListLocationsHandlerInput {
	accountId: string;
	credentialsProvider: CredentialsProvider;
	region: string;
}

export const createListLocationsHandler = (
	// eslint-disable-next-line unused-imports/no-unused-vars
	input: CreateListLocationsHandlerInput,
): ListLocations => {
	const config = {
		credentials: input.credentialsProvider,
		region: input.region,
	};

	return async (handlerInput = {}) => {
		const { nextToken, pageSize } = handlerInput;
		logger.debug(`list available locations from account ${input.accountId}`);
		const params = {
			AccountId: input.accountId,
			NextToken: nextToken,
			MaxKeys: pageSize,
		};
		if (!!pageSize && pageSize > MAX_PAGE_SIZE) {
			logger.debug(`defaulting pageSize to ${MAX_PAGE_SIZE}.`);
			params.MaxKeys = MAX_PAGE_SIZE;
		}
		const { result } = await listCallerAccessGrants(config, params);

		// TODO
		return result;
	};
};
