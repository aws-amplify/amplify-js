// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAction } from '@aws-amplify/core/internals/utils';
import { CredentialsProviderOptions } from '@aws-amplify/core/internals/aws-client-utils';
import { ResponseMetadata } from '@aws-amplify/core/dist/esm/types';

import { logger } from '../../utils';
import { listCallerAccessGrants as listCallerAccessGrantsClient } from '../../providers/s3/utils/client/s3control';
import { StorageError } from '../../errors/StorageError';
import { getStorageUserAgentValue } from '../../providers/s3/utils/userAgent';
import { LocationType } from '../types/common';
import { LocationAccess } from '../types/credentials';
import { ListCallerAccessGrantsInput } from '../types/inputs';
import { ListCallerAccessGrantsOutput } from '../types/outputs';
import { MAX_PAGE_SIZE } from '../utils/constants';

/**
 * @internal
 */
export const listCallerAccessGrants = async (
	input: ListCallerAccessGrantsInput,
): Promise<ListCallerAccessGrantsOutput> => {
	const {
		credentialsProvider,
		accountId,
		region,
		nextToken,
		pageSize,
		customEndpoint,
	} = input;

	logger.debug(`listing available locations from account ${input.accountId}`);

	if (!!pageSize && pageSize > MAX_PAGE_SIZE) {
		logger.debug(`defaulting pageSize to ${MAX_PAGE_SIZE}.`);
	}

	const clientCredentialsProvider = async (
		options?: CredentialsProviderOptions,
	) => {
		const { credentials } = await credentialsProvider(options);

		return credentials;
	};

	const { CallerAccessGrantsList, NextToken, $metadata } =
		await listCallerAccessGrantsClient(
			{
				credentials: clientCredentialsProvider,
				customEndpoint,
				region,
				userAgentValue: getStorageUserAgentValue(
					StorageAction.ListCallerAccessGrants,
				),
			},
			{
				AccountId: accountId,
				NextToken: nextToken,
				MaxResults: pageSize ?? MAX_PAGE_SIZE,
				AllowedByApplication: true,
			},
		);

	const accessGrants: LocationAccess[] =
		CallerAccessGrantsList?.map(grant => {
			assertGrantScope(grant.GrantScope, $metadata);

			return {
				scope: grant.GrantScope,
				permission: grant.Permission!,
				type: parseGrantType(grant.GrantScope!),
			};
		}) ?? [];

	return {
		locations: accessGrants,
		nextToken: NextToken,
	};
};

const parseGrantType = (grantScope: string): LocationType => {
	const bucketScopeReg = /^s3:\/\/(.*)\/\*$/;
	const possibleBucketName = grantScope.match(bucketScopeReg)?.[1];
	if (!grantScope.endsWith('*')) {
		return 'OBJECT';
	} else if (
		grantScope.endsWith('/*') &&
		possibleBucketName &&
		possibleBucketName.indexOf('/') === -1
	) {
		return 'BUCKET';
	} else {
		return 'PREFIX';
	}
};

function assertGrantScope(
	value: unknown,
	responseMetadata: ResponseMetadata,
): asserts value is string {
	if (typeof value !== 'string' || !value.startsWith('s3://')) {
		throw new StorageError({
			name: 'InvalidGrantScope',
			message: `Expected a valid grant scope, got ${value}`,
			metadata: responseMetadata,
		});
	}
}
