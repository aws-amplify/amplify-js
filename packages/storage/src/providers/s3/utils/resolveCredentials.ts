// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { fetchAuthSession } from '@aws-amplify/core';

export const resolveCredentials = async () => {
	const { identityId, credentials } = await fetchAuthSession({
		forceRefresh: false,
	});
	assertValidationError(
		!!credentials,
		StorageValidationErrorCode.NoCredentials
	);
	assertValidationError(!!identityId, StorageValidationErrorCode.NoIdentityId);
	return {
		identityId,
		credentials,
	};
};
