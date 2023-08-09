// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { prefixResolver as defaultPrefixResolver } from '../../../utils/prefixResolver';

export async function getStorageConfig() {
	const { awsCredsIdentityId, awsCreds } =
		await AmplifyV6.Auth.fetchAuthSession();
	assertValidationError(
		!!awsCredsIdentityId,
		StorageValidationErrorCode.NoCredentials
	);
	assertValidationError(!!awsCreds, StorageValidationErrorCode.NoCredentials);
	const { bucket, region } = AmplifyV6.getConfig()?.Storage ?? {};
	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);
	assertValidationError(!!region, StorageValidationErrorCode.NoRegion);
	const { defaultAccessLevel } = AmplifyV6.libraryOptions?.Storage ?? {};
	return {
		awsCredsIdentityId,
		awsCreds,
		defaultAccessLevel,
		bucket,
		region,
	};
}

// use prefixResolver to get the final key
export function getFinalKey(accessLevel, awsCredsIdentityId, key) {
	const { prefixResolver = defaultPrefixResolver } =
		AmplifyV6.libraryOptions?.Storage ?? {};
	return (
		prefixResolver({
			accessLevel,
			targetIdentityId: awsCredsIdentityId,
		}) + key
	);
}
