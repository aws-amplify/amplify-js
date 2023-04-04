// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthErrorParams } from './types/models';

export class AuthError extends Error {
	underlyingError?: Error | unknown;
	recoverySuggestion?: string;
	/**
	 * Creates an Auth error
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
	}: AuthErrorParams) {
		super(message);

		this.name = name;
		this.underlyingError = underlyingError;
		this.recoverySuggestion = recoverySuggestion;
	}
}
