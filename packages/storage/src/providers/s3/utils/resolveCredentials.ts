// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

export async function resolveCredentials() {
	// TODO[kvramya7] import fetchAuthSession directly from `aws-amplify`
	const { identityId, credentials } = await AmplifyV6.Auth.fetchAuthSession();
	assertValidationError(
		!!credentials,
		StorageValidationErrorCode.NoCredentials
	);
	assertValidationError(!!identityId, StorageValidationErrorCode.NoIdentityId);
	return {
		identityId,
		credentials,
	};
}
