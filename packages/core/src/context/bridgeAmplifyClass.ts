// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClass } from '../singleton/Amplify';

import { AmplifyContext } from './AmplifyContext';
import { AMPLIFY_CONTEXT_BRAND } from './contextBrand';
import { createAmplifyContextToken } from './contextToken';

/**
 * Bridges an {@link AmplifyClass} (a.k.a. `AmplifyClassV6`) instance to the
 * {@link AmplifyContext} shape.
 *
 * `AmplifyClass` exposes `resourcesConfig` / `libraryOptions` directly but does
 * NOT surface the top-level context methods (`fetchAuthSession` /
 * `clearCredentials` / `getTokens`). Those live under its cross-category `Auth`
 * utility, so this helper maps them through.
 *
 * This is the single shared implementation promoted into core (Phase C1). It is
 * consumed by:
 * - The server wrapper where a legacy `ContextSpec` provides an `AmplifyClass` instance.
 * - The category internals (e.g. api-graphql / api-rest) that still receive an
 *   `AmplifyClassV6` until they migrate fully to `AmplifyContext`.
 *
 * @internal
 */
export const bridgeAmplifyClass = (amplify: AmplifyClass): AmplifyContext => {
	const resolved: AmplifyContext = {
		get resourcesConfig() {
			return amplify.getConfig();
		},
		// Live getter: AmplifyClass.libraryOptions is REASSIGNED wholesale on
		// configure(), so a snapshot would go stale.
		get libraryOptions() {
			return amplify.libraryOptions;
		},
		// Unique, frozen per-context identity handle (see AmplifyContextToken).
		// Attached before the brand/freeze below so the frozen bridge carries it.
		token: createAmplifyContextToken(),
		// AmplifyContext.fetchAuthSession has OPTIONAL options while
		// AuthClass.Auth.fetchAuthSession requires it, hence the `?? {}` default.
		fetchAuthSession: options => amplify.Auth.fetchAuthSession(options ?? {}),
		clearCredentials: () => amplify.Auth.clearCredentials(),
		// getTokens needs no default — options is required on both interfaces.
		getTokens: options => amplify.Auth.getTokens(options),
	};

	// Branding makes downstream isAmplifyContext checks (e.g. internalPost)
	// recognize an already-bridged context, preventing double-bridging which
	// would break the Auth.* closures. Explicit descriptor (non-writable /
	// non-configurable) mirrors the other AmplifyContext producers.
	Object.defineProperty(resolved, AMPLIFY_CONTEXT_BRAND, {
		value: true,
		enumerable: false,
		configurable: false,
		writable: false,
	});

	// Freeze for parity with the other producers (createAmplifyContext, singleton
	// Amplify.ts) so the method closures cannot be reassigned downstream. Frozen
	// AFTER defining the getters/brand: the `resourcesConfig` / `libraryOptions`
	// accessors remain live (getters still evaluate on a frozen object), while
	// the data-valued method properties become non-writable.
	Object.freeze(resolved);

	return resolved;
};
