// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ServiceError } from '@aws-amplify/core/src/types/types';
import { AuthError } from '../AuthError';

export function assertServiceError(
	error: unknown
): asserts error is ServiceError {
	if (
		!error ||
		!((error as ServiceError).name && (error as ServiceError).message)
	) {
		throw new AuthError({
			name: 'UnknownError',
			message: 'An unknown error has ocurred.',
			underlyingError: error,
		});
	}
}
