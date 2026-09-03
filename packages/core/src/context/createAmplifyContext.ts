// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthClass } from '../singleton/Auth';
import {
	AmplifyOutputsUnknown,
	LegacyConfig,
	LibraryOptions,
	ResourcesConfig,
} from '../singleton/types';
import { deepFreeze } from '../utils/deepFreeze';
import { parseAmplifyConfig } from '../utils/parseAmplifyConfig';

import { AmplifyContext } from './AmplifyContext';
import { AMPLIFY_CONTEXT_BRAND } from './contextBrand';
import { createAmplifyContextToken } from './contextToken';

/**
 * Creates a local, branded {@link AmplifyContext} from the given resource
 * configuration.
 *
 * Unlike `Amplify.configure()`, the returned context is **not** set as the
 * global context and no Hub events are dispatched. Category APIs that receive
 * this context (as their first positional argument) will use it instead of the
 * global one, enabling per-request context injection in server-side /
 * multi-tenant scenarios.
 *
 * The factory follows the "factory-provider" style: it instantiates a **fresh,
 * per-context** {@link AuthClass} (never the process-wide singleton) whose
 * `fetchAuthSession` / `clearCredentials` / `getTokens` closures back the
 * returned context's methods. The context is branded via
 * {@link AMPLIFY_CONTEXT_BRAND} and frozen so it can be recognized at runtime
 * by `isAmplifyContext()` and cannot be mutated after creation.
 *
 * @remarks
 * `@aws-amplify/core` sits at the bottom of the dependency graph and therefore
 * cannot import the Cognito token/credentials provider factories (those live in
 * the `aws-amplify` umbrella package and depend on `@aws-amplify/auth`). As a
 * result this core-level factory does **not** inject default providers: callers
 * that need auth must supply `libraryOptions.Auth.{tokenProvider,credentialsProvider}`.
 * The `aws-amplify` package wraps this factory (Phase C2) to resolve and inject
 * the default Cognito providers (SSR cookie storage vs. localStorage) before
 * delegating here.
 *
 * @param resourceConfig - Back-end resource configuration (typed config,
 *   legacy `aws-exports`, or `amplify_outputs`).
 * @param libraryOptions - Optional library options (e.g. Auth token/credentials
 *   providers, `ssr`).
 * @param internalOptions - Internal-only options. `skipConfigParse` lets a
 *   trusted caller (the `aws-amplify` wrapper) that has *already* normalized the
 *   config via `parseAmplifyConfig` opt out of a redundant re-parse. Since
 *   `parseAmplifyConfig` is a no-op on an already-parsed `ResourcesConfig`, this
 *   only removes duplicate work (which otherwise runs on every context creation,
 *   and twice per SSR request through adapter-nextjs) — behavior is identical.
 * @returns A branded, frozen {@link AmplifyContext}.
 *
 * @example
 * ```ts
 * import { createAmplifyContext } from '@aws-amplify/core';
 *
 * const ctx = createAmplifyContext(resourcesConfig, {
 *   Auth: { tokenProvider, credentialsProvider },
 * });
 * // Pass ctx explicitly to category APIs:
 * await signIn(ctx, { username, password });
 * ```
 */
export function createAmplifyContext(
	resourceConfig: ResourcesConfig | LegacyConfig | AmplifyOutputsUnknown,
	libraryOptions?: LibraryOptions,
	internalOptions?: {
		/** @internal Skip re-parsing an already-normalized `ResourcesConfig`. */
		skipConfigParse?: boolean;
	},
): AmplifyContext {
	// `parseAmplifyConfig` returns an already-parsed `ResourcesConfig` unchanged,
	// so skipping it when the caller has pre-parsed keeps behavior identical while
	// avoiding a redundant parse.
	//
	// The resolved config is DEEP-frozen (matching `Amplify.configure()` in
	// Amplify.ts) on BOTH paths: a shallow `Object.freeze` would leave nested
	// config (e.g. `Auth.Cognito`) mutable, and on the `skipConfigParse` path the
	// caller's object passes through by reference — potentially SHARED between
	// several per-request contexts (adapter-nextjs reuses one parsed config for
	// every request), so any nested mutation would leak across contexts.
	// `deepFreeze` is idempotent, so re-freezing that shared object is safe.
	const resolvedResourceConfig: ResourcesConfig = deepFreeze(
		internalOptions?.skipConfigParse
			? (resourceConfig as ResourcesConfig)
			: parseAmplifyConfig(resourceConfig),
	);
	const resolvedLibraryOptions: LibraryOptions = libraryOptions ?? {};

	// Fresh, per-context Auth instance (not the global singleton) so that
	// multiple contexts remain isolated from one another.
	const auth = new AuthClass();
	if (resolvedResourceConfig.Auth) {
		auth.configure(resolvedResourceConfig.Auth, resolvedLibraryOptions.Auth);
	}

	const ctx: AmplifyContext = {
		// Already deep-frozen above (both parse paths).
		resourcesConfig: resolvedResourceConfig,
		libraryOptions: resolvedLibraryOptions,
		// Unique, frozen per-context identity handle (see AmplifyContextToken).
		// Attached before the brand/freeze below so the frozen context carries it.
		token: createAmplifyContextToken(),
		fetchAuthSession: fetchOptions => auth.fetchAuthSession(fetchOptions ?? {}),
		clearCredentials: () => auth.clearCredentials(),
		getTokens: tokenOptions => auth.getTokens(tokenOptions),
	};

	// Brand the context for runtime identification by isAmplifyContext().
	Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, {
		value: true,
		enumerable: false,
		configurable: false,
		writable: false,
	});

	Object.freeze(ctx);

	return ctx;
}
