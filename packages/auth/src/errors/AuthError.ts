// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyError } from '@aws-amplify/core/src/Errors';
import { ErrorParams } from '@aws-amplify/core/src/types/types';

export class AuthError extends AmplifyError {
	/**
	 *
	 * @param message text that describes the main problem.
	 * @param underlyingError the underlying cause of the error.
	 * @param recoverySuggestion suggestion to recover from the error.
	 *
	 */
	constructor({
		message,
		name,
		recoverySuggestion,
		underlyingError,
	}: ErrorParams) {
		super({ message, name, recoverySuggestion, underlyingError });
	}
}
