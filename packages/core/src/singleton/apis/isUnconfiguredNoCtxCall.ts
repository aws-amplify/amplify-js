// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isAmplifyContext } from '../../context/contextBrand';
import { hasGlobalContext } from '../../context/globalContext';

/**
 * Returns `true` when a call would fall back to the global `AmplifyContext`
 * but none has been set yet (i.e. `Amplify.configure()` has not run).
 *
 * The pre-context library did not throw for this case — it operated on the
 * unconfigured singleton, whose `AuthClass` optional-chains its (missing)
 * providers. `fetchAuthSession`/`clearCredentials` use this predicate to
 * preserve that behavior for the no-context form.
 *
 * The `resolveCtxArgs` guard cases are deliberately excluded so their typed
 * errors keep throwing:
 * - a branded context anywhere in `args` (explicit-context or mis-ordered);
 * - an explicitly-`undefined` leading context followed by more arguments.
 *
 * @internal
 */
export function isUnconfiguredNoCtxCall(args: unknown[]): boolean {
	return (
		!hasGlobalContext() &&
		!args.some(isAmplifyContext) &&
		!(args.length > 1 && args[0] === undefined)
	);
}
