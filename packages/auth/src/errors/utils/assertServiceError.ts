// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../AuthError';
import { AmplifyErrorString, ServiceError } from '@aws-amplify/core';

export function assertServiceError(
	error: unknown
): asserts error is ServiceError {
	if (
		!error ||
		(error as ServiceError).name === Error.name ||
		!((error as ServiceError).name && (error as ServiceError).message)
	) {
		throw new AuthError({
			name: AmplifyErrorString.UNKNOWN,
			message: 'An unknown error has ocurred.',
			underlyingError: error,
		});
	}
}
