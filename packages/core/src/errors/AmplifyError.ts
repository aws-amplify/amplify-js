// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorParams } from '../types/errors';

export class AmplifyError extends Error {
	underlyingError?: Error | unknown;
	recoverySuggestion?: string;
	/**
	 *  Constructs an AmplifyError.
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
	}: AmplifyErrorParams) {
		super(message);

		this.name = name;
		this.underlyingError = underlyingError;
		this.recoverySuggestion = recoverySuggestion;

		// Hack for making the custom error class work when transpiled to es5
		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = AmplifyError;
		Object.setPrototypeOf(this, AmplifyError.prototype);
	}
}
