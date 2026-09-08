// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyError } from './AmplifyError';

/**
 * Stable error name/code thrown when a context is required but none is
 * available (i.e. `Amplify.configure()` has not been called and no context was
 * passed explicitly). Exposed as a constant so category packages can reliably
 * catch this failure by name without importing the class.
 */
export const NO_AMPLIFY_CONTEXT_ERROR_NAME = 'NoAmplifyContextError';

/**
 * Thrown when a category API resolves the global {@link AmplifyContext} but none
 * has been set (the "unconfigured" path).
 *
 * Uses core's {@link AmplifyError} machinery so consumers can catch it via
 * `instanceof AmplifyError` / `instanceof NoAmplifyContextError`, or by the
 * stable `name` ({@link NO_AMPLIFY_CONTEXT_ERROR_NAME}).
 */
export class NoAmplifyContextError extends AmplifyError {
	constructor(
		message = 'No AmplifyContext available. Call Amplify.configure() to set a global context, ' +
			'or pass a context as the first argument.',
	) {
		super({
			name: NO_AMPLIFY_CONTEXT_ERROR_NAME,
			message,
			recoverySuggestion:
				'Call Amplify.configure() before using this API, or pass an AmplifyContext ' +
				'created via createAmplifyContext() as the first argument.',
		});

		// Hack for making the custom error class work when transpiled to es5.
		this.constructor = NoAmplifyContextError;
		Object.setPrototypeOf(this, NoAmplifyContextError.prototype);
	}
}
