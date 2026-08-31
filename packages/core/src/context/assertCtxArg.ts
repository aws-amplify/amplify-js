// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InvalidAmplifyContextError } from '../errors/InvalidAmplifyContextError';

import { AmplifyContext } from './AmplifyContext';
import { isAmplifyContext } from './contextBrand';

/**
 * Assertion guard for category class constructors (and other call sites) that
 * accept an **optional** leading {@link AmplifyContext} argument.
 *
 * - `undefined` is allowed (the caller will fall back to the global context
 *   lazily — constructors MUST NOT capture `getGlobalContext()` eagerly).
 * - A branded {@link AmplifyContext} is allowed.
 * - Any other defined value (a plain options object, an `AmplifyClass`
 *   instance, etc.) is rejected with a typed {@link InvalidAmplifyContextError},
 *   so an unbranded value passed in the context position fails loudly instead
 *   of being silently treated as a valid context.
 *
 * This complements {@link resolveCtxArgs}, which handles the function-argument
 * (tuple) pattern, by covering the constructor / single-slot pattern.
 *
 * @throws {@link InvalidAmplifyContextError} when `ctx` is defined but is not a
 *   branded {@link AmplifyContext}.
 *
 * @internal
 */
export function assertOptionalCtxArg(
	ctx: unknown,
): asserts ctx is AmplifyContext | undefined {
	if (ctx !== undefined && !isAmplifyContext(ctx)) {
		throw new InvalidAmplifyContextError();
	}
}
