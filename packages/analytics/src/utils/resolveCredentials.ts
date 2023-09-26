// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsValidationErrorCode, assertValidationError } from '../errors';
import { fetchAuthSession } from '@aws-amplify/core';

export const resolveCredentials = async () => {
	const { credentials, identityId } = await fetchAuthSession();
	assertValidationError(
		!!credentials,
		AnalyticsValidationErrorCode.NoCredentials
	);
	return { credentials, identityId };
};
