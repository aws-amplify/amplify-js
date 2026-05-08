// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from './AmplifyContext';

/**
 * Symbol brand used to identify {@link AmplifyContext} objects at runtime.
 * Uses `Symbol.for()` so the brand is shared across module instances
 * (e.g. when `@aws-amplify/core` is accidentally duplicated in the bundle).
 */
export const AMPLIFY_CONTEXT_BRAND = Symbol.for('amplify.context');

/**
 * Returns `true` if the given value is a branded {@link AmplifyContext}.
 */
export function isAmplifyContext(value: unknown): value is AmplifyContext {
	return (
		value !== null &&
		value !== undefined &&
		typeof value === 'object' &&
		AMPLIFY_CONTEXT_BRAND in (value as Record<symbol, unknown>)
	);
}
