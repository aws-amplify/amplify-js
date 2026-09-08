// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NoAmplifyContextError } from '../errors/NoAmplifyContextError';

import { AmplifyContext } from './AmplifyContext';

let _globalContext: AmplifyContext | null = null;

/**
 * Returns the global {@link AmplifyContext} set by `Amplify.configure()`.
 *
 * @throws {@link NoAmplifyContextError} If `Amplify.configure()` has not been
 * called yet and no context is available.
 */
export function getGlobalContext(): AmplifyContext {
	if (!_globalContext) {
		// Typed error (stable name/code) so categories can catch the unconfigured
		// path uniformly. Message text is preserved for back-compat.
		throw new NoAmplifyContextError();
	}

	return _globalContext;
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
