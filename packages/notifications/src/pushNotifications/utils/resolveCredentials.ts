// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import {
	assert,
	PushNotificationValidationErrorCode,
} from '../errors/errorHelpers';

/**
 * @internal
 */
export const resolveCredentials = async () => {
	const { credentials, identityId } = await fetchAuthSession();
	assert(!!credentials, PushNotificationValidationErrorCode.NoCredentials);
	return { credentials, identityId };
};
