// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAction } from '@aws-amplify/core/internals/utils';
import { CredentialsProviderOptions } from '@aws-amplify/core/internals/aws-client-utils';

import { logger } from '../../utils';
import { listCallerAccessGrants as listCallerAccessGrantsClient } from '../../providers/s3/utils/client/s3control';
import { AccessGrant, LocationType, Permission } from '../types';
import { StorageError } from '../../errors/StorageError';
import { getStorageUserAgentValue } from '../../providers/s3/utils/userAgent';

import {
	ListCallerAccessGrantsInput,
	ListCallerAccessGrantsOutput,
} from './types';
import { MAX_PAGE_SIZE } from './constants';

export const listCallerAccessGrants = async (
	input: ListCallerAccessGrantsInput,
): Promise<ListCallerAccessGrantsOutput> => {
	const { credentialsProvider, accountId, region, nextToken, pageSize } = input;

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

	const { CallerAccessGrantsList, NextToken } =
		await listCallerAccessGrantsClient(
			{
				credentials: clientCredentialsProvider,
				region,
				userAgentValue: getStorageUserAgentValue(
					StorageAction.ListCallerAccessGrants,
				),
			},
			{
				AccountId: accountId,
				NextToken: nextToken,
				MaxResults: pageSize ?? MAX_PAGE_SIZE,
			},
		);

	const accessGrants: AccessGrant[] =
		CallerAccessGrantsList?.map(grant => {
			// These values are correct from service mostly, but we add assertions to make TSC happy.
			assertPermission(grant.Permission);
			assertGrantScope(grant.GrantScope);

			return {
				scope: grant.GrantScope,
				permission: grant.Permission,
				applicationArn: grant.ApplicationArn,
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

function assertPermission(
	permissionValue: string | undefined,
): asserts permissionValue is Permission {
	if (!['READ', 'READWRITE', 'WRITE'].includes(permissionValue ?? '')) {
		throw new StorageError({
			name: 'InvalidPermission',
			message: `Invalid permission: ${permissionValue}`,
		});
	}
}

function assertGrantScope(value: unknown): asserts value is string {
	if (typeof value !== 'string' || !value.startsWith('s3://')) {
		throw new StorageError({
			name: 'InvalidGrantScope',
			message: `Expected a valid grant scope, got ${value}`,
		});
	}
}
