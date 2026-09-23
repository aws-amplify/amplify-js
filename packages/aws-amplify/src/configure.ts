// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	LibraryOptions,
	ResourcesConfig,
	createAmplifyContext as createCoreAmplifyContext,
} from '@aws-amplify/core';
import {
	AmplifyOutputsUnknown,
	LegacyConfig,
	parseAmplifyConfig,
	selectSsrKeyValueStorage,
} from '@aws-amplify/core/internals/utils';

import {
	createAWSCredentialsAndIdentityIdProvider,
	createUserPoolsTokenProvider,
} from './adapter-core/authProvidersFactories/cognito';

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
 * This is the `aws-amplify`-level wrapper around
 * {@link createCoreAmplifyContext | `@aws-amplify/core`'s `createAmplifyContext`}.
 * The core factory intentionally does **not** inject default Cognito providers
 * (it sits below `@aws-amplify/auth` in the dependency graph); this wrapper
 * closes that gap by resolving and injecting **factory-style, per-context**
 * Cognito token/credentials providers when the caller does not supply their own.
 * Because each call builds fresh provider instances, contexts created here do
 * **not** share the process-wide singleton providers used by
 * `Amplify.configure()` — two contexts remain isolated from one another.
 *
 * Storage behaviour mirrors `Amplify.configure()`: tokens are persisted to
 * `localStorage` by default, or to cookies when `{ ssr: true }` is set.
 *
 * @param resourceConfig - Back-end resource configuration (typed config,
 *   legacy `aws-exports`, or Gen2 `amplify_outputs`).
 * @param libraryOptions - Optional library options (e.g. Auth token/credentials
 *   providers, `ssr`).
 * @returns A branded, frozen {@link AmplifyContext}.
 *
 * @example
 * ```ts
 * import { createAmplifyContext } from 'aws-amplify';
 * import outputs from './amplify_outputs.json';
 *
 * const ctx = createAmplifyContext(outputs);
 * // Pass ctx explicitly to category APIs:
 * await signIn(ctx, { username, password });
 * ```
 */
export function createAmplifyContext(
	resourceConfig: ResourcesConfig | LegacyConfig | AmplifyOutputsUnknown,
	libraryOptions?: LibraryOptions,
): AmplifyContext {
	const resolvedResourceConfig = parseAmplifyConfig(resourceConfig);
	const resolvedLibraryOptions = resolveLocalLibraryOptions(
		resolvedResourceConfig,
		libraryOptions,
	);

	// Delegate to core for branding + freezing + the per-context AuthClass.
	// We already parsed `resourceConfig` above (the parsed shape is required by
	// `resolveLocalLibraryOptions` to inject default Cognito providers), so tell
	// core to skip re-parsing. This removes a redundant `parseAmplifyConfig` call
	// on every context creation — and two per SSR request via adapter-nextjs —
	// without changing behavior, because `parseAmplifyConfig` is a no-op on an
	// already-normalized `ResourcesConfig`.
	return createCoreAmplifyContext(
		resolvedResourceConfig,
		resolvedLibraryOptions,
		{ skipConfigParse: true },
	);
}

/**
 * Resolves the effective {@link LibraryOptions} for a locally-created context,
 * injecting default **factory-style** Cognito providers when the caller does
 * not supply their own.
 *
 * - No `Auth` in the resource config → pass options through unchanged.
 * - Caller-provided `libraryOptions.Auth` → take precedence (no defaults).
 * - Otherwise → build per-context token/credentials providers backed by
 *   cookie storage (`ssr: true`) or `localStorage` (default).
 */
function resolveLocalLibraryOptions(
	resourceConfig: ResourcesConfig,
	libraryOptions?: LibraryOptions,
): LibraryOptions {
	if (!resourceConfig.Auth) {
		return libraryOptions ?? {};
	}

	// User-provided providers take precedence.
	if (libraryOptions?.Auth) {
		return libraryOptions;
	}

	// Resolve storage via core's shared helper based on the SSR option:
	// - ssr: true  → CookieStorage (shared between client and server)
	// - ssr: false → defaultStorage (localStorage with server-safe fallback)
	const keyValueStorage = selectSsrKeyValueStorage(libraryOptions?.ssr);
	const tokenProvider = createUserPoolsTokenProvider(
		resourceConfig.Auth,
		keyValueStorage,
	);
	const credentialsProvider = createAWSCredentialsAndIdentityIdProvider(
		resourceConfig.Auth,
		keyValueStorage,
	);

	return {
		...libraryOptions,
		Auth: { tokenProvider, credentialsProvider },
	};
}
