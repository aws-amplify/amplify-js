// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { RestApiValidationErrorCode, assertValidationError } from '../errors';

/**
 * @internal
 */
export const resolveCredentials = async (amplify: AmplifyClassV6) => {
	const { credentials } = await amplify.Auth.fetchAuthSession();
	assertValidationError(
		!!credentials && !!credentials.accessKeyId && !!credentials.secretAccessKey,
		RestApiValidationErrorCode.NoCredentials
	);
	return credentials;
};
