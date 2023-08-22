// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsError } from './AnalyticsError';
import { AmplifyErrorString, ServiceError } from '@aws-amplify/core';

/**
 * @internal
 */
export function assertServiceError(
	error: unknown
): asserts error is ServiceError {
	if (
		!error ||
		(error as ServiceError).name === 'Error' ||
		error instanceof TypeError
	) {
		throw new AnalyticsError({
			name: AmplifyErrorString.UNKNOWN,
			message: 'An unknown error has ocurred.',
			underlyingError: error,
		});
	}
}
