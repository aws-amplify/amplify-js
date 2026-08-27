// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthClass } from '../singleton/Auth';
import {
	AmplifyOutputsUnknown,
	LegacyConfig,
	LibraryOptions,
	ResourcesConfig,
} from '../singleton/types';
import { parseAmplifyConfig } from '../utils/parseAmplifyConfig';

import { AmplifyContext } from './AmplifyContext';
import { AMPLIFY_CONTEXT_BRAND } from './contextBrand';

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
): AmplifyContext {
	const resolvedResourceConfig = parseAmplifyConfig(resourceConfig);
	const resolvedLibraryOptions: LibraryOptions = libraryOptions ?? {};

	// Fresh, per-context Auth instance (not the global singleton) so that
	// multiple contexts remain isolated from one another.
	const auth = new AuthClass();
	if (resolvedResourceConfig.Auth) {
		auth.configure(resolvedResourceConfig.Auth, resolvedLibraryOptions.Auth);
	}

	const ctx: AmplifyContext = {
		resourcesConfig: Object.freeze(resolvedResourceConfig),
		libraryOptions: resolvedLibraryOptions,
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
