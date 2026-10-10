// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyError } from './AmplifyError';

/**
 * Stable error name/code thrown when a value is passed where an
 * {@link AmplifyContext} is expected, but it is not a branded context (e.g. a
 * plain options object or an `AmplifyClass` instance was mistakenly passed in
 * the context position). Exposed as a constant so category packages can catch
 * this failure by name without importing the class.
 */
export const INVALID_AMPLIFY_CONTEXT_ERROR_NAME = 'InvalidAmplifyContextError';

/**
 * Thrown when a defined-but-unbranded value is supplied where an
 * {@link AmplifyContext} is required (e.g. category class constructors that
 * accept an optional leading context argument).
 *
 * Uses core's {@link AmplifyError} machinery so consumers can catch it via
 * `instanceof AmplifyError` / `instanceof InvalidAmplifyContextError`, or by the
 * stable `name` ({@link INVALID_AMPLIFY_CONTEXT_ERROR_NAME}).
 */
export class InvalidAmplifyContextError extends AmplifyError {
	constructor(
		message = 'Invalid AmplifyContext. The value passed in the context position is not a ' +
			'branded AmplifyContext.',
	) {
		super({
			name: INVALID_AMPLIFY_CONTEXT_ERROR_NAME,
			message,
			recoverySuggestion:
				'Pass an AmplifyContext created via createAmplifyContext() (or Amplify.configure()), ' +
				'or omit the argument to use the global context.',
		});

		// Hack for making the custom error class work when transpiled to es5.
		this.constructor = InvalidAmplifyContextError;
		Object.setPrototypeOf(this, InvalidAmplifyContextError.prototype);
	}
}
