// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { APIValidationErrorCode, assertValidationError } from './errors';

/**
 * @internal
 */
export const resolveCredentials = async () => {
	const { credentials, identityId } = await fetchAuthSession();
	assertValidationError(!!credentials, APIValidationErrorCode.NoCredentials);
	return { credentials, identityId };
};
