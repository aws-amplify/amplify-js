// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import {
	LoggingValidationErrorCode,
	assertValidationError,
} from '../../../errors';

/**
 * @internal
 */
export const resolveCredentials = async () => {
	const { credentials } = await fetchAuthSession();
	assertValidationError(
		!!credentials,
		LoggingValidationErrorCode.NoCredentials
	);
	return { credentials };
};
