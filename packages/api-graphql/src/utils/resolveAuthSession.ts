// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { APIValidationErrorCode, assertValidationError } from './errors';

/**
 * @internal
 */
export const resolveAuthSession = async () => {
	const { credentials, identityId, tokens } = await fetchAuthSession();

	assertValidationError(
		!!credentials && !!identityId && !!tokens,
		APIValidationErrorCode.NoAuthSession
	);
	return { credentials, identityId, tokens };
};
