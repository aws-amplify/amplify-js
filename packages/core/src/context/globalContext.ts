// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from './AmplifyContext';

let _globalContext: AmplifyContext | null = null;

/**
 * Returns the global {@link AmplifyContext} set by `Amplify.configure()`.
 *
 * @throws If `Amplify.configure()` has not been called yet.
 */
export function getActiveContext(): AmplifyContext {
	if (!_globalContext) {
		throw new Error(
			'No AmplifyContext available. Call Amplify.configure() to set a global context, ' +
				'or pass a context as the first argument.',
		);
	}

	return _globalContext;
}

/**
 * Returns the global {@link AmplifyContext} set by `Amplify.configure()`.
 * Alias for {@link getActiveContext} — provided for semantic clarity.
 *
 * @throws If `Amplify.configure()` has not been called yet.
 */
export function getGlobalContext(): AmplifyContext {
	return getActiveContext();
}

/**
 * Stores the given context as the global {@link AmplifyContext}.
 *
 * @internal
 */
export function setGlobalContext(ctx: AmplifyContext): void {
	_globalContext = ctx;
}

/**
 * Returns `true` if a global {@link AmplifyContext} has been set.
 */
export function hasGlobalContext(): boolean {
	return _globalContext !== null;
}

/**
 * Clears the global {@link AmplifyContext}.
 *
 * @internal — intended for testing and HMR.
 */
export function clearGlobalContext(): void {
	_globalContext = null;
}
