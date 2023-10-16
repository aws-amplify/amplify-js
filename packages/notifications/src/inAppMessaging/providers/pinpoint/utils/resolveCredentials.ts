// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import {
	InAppMessagingValidationErrorCode,
	assertValidationError,
} from '../../../errors';

/**
 * @internal
 */
export const resolveCredentials = async () => {
	const { credentials, identityId } = await fetchAuthSession();
	assertValidationError(
		!!credentials,
		InAppMessagingValidationErrorCode.NoCredentials
	);
	return { credentials, identityId };
};
