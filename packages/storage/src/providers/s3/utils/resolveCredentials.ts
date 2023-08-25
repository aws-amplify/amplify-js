// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

export const resolveCredentials = async (amplify: AmplifyClassV6) => {
	const { identityId, credentials } = await amplify.Auth.fetchAuthSession();
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
