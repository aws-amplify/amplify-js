// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';

import { StorageError } from '../../../../../errors/StorageError';

export function validateS3RequiredParameter(
	assertion: boolean,
	paramName: string,
): asserts assertion {
	if (!assertion) {
		throw new StorageError({
			name: AmplifyErrorCode.Unknown,
			message: 'An unknown error has occurred.',
			underlyingError: new TypeError(
				`Expected a non-null value for S3 parameter ${paramName}`,
			),
			recoverySuggestion:
				'This is likely to be a bug. Please reach out to library authors.',
		});
	}
}
