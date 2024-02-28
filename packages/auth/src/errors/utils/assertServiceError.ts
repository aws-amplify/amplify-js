// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyErrorCode,
	ServiceError,
} from '@aws-amplify/core/internals/utils';

import { AuthError } from '../AuthError';

export function assertServiceError(
	error: unknown,
): asserts error is ServiceError {
	if (
		!error ||
		(error as ServiceError).name === 'Error' ||
		error instanceof TypeError
	) {
		throw new AuthError({
			name: AmplifyErrorCode.Unknown,
			message: 'An unknown error has occurred.',
			underlyingError: error,
		});
	}
}
