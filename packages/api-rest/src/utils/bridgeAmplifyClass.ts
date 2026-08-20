// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AMPLIFY_CONTEXT_BRAND,
	AmplifyClassV6,
	AmplifyContext,
} from '@aws-amplify/core';

/**
 * Bridges an {@link AmplifyClassV6} instance to the {@link AmplifyContext} shape.
 *
 * `AmplifyClassV6` (a.k.a. `AmplifyClass`) exposes `resourcesConfig` / `libraryOptions`
 * directly but does NOT surface the top-level context methods
 * (`fetchAuthSession` / `clearCredentials` / `getTokens`). Those live under its
 * cross-category `Auth` utility, so this helper maps them through.
 *
 * This is used:
 * - In the server wrapper where a legacy `ContextSpec` provides an `AmplifyClass` instance.
 * - In the internals `post` function where dependents (e.g. api-graphql) still pass
 *   an `AmplifyClassV6` until they migrate to `AmplifyContext`.
 *
 * @internal
 */
export const bridgeAmplifyClass = (amplify: AmplifyClassV6): AmplifyContext => {
	const resolved: AmplifyContext = {
		get resourcesConfig() {
			return amplify.getConfig();
		},
		// Live getter: AmplifyClass.libraryOptions is REASSIGNED wholesale on
		// configure(), so a snapshot would go stale.
		get libraryOptions() {
			return amplify.libraryOptions;
		},
		// AmplifyContext.fetchAuthSession has OPTIONAL options while
		// AuthClass.Auth.fetchAuthSession requires it, hence the `?? {}` default.
		fetchAuthSession: options => amplify.Auth.fetchAuthSession(options ?? {}),
		clearCredentials: () => amplify.Auth.clearCredentials(),
		// getTokens needs no default — options is required on both interfaces.
		getTokens: options => amplify.Auth.getTokens(options),
	};

	// Branding makes downstream isAmplifyContext checks (e.g. internalPost)
	// recognize an already-bridged context, preventing double-bridging which
	// would break the Auth.* closures.
	Object.defineProperty(resolved, AMPLIFY_CONTEXT_BRAND, {
		value: true,
		enumerable: false,
	});

	return resolved;
};
