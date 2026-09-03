// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	createAmplifyServerContext,
	destroyAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { AmplifyError } from '@aws-amplify/core/internals/utils';

/**
 * The low level function that supports framework specific helpers.
 * It creates an Amplify server context based on the input and runs the
 * operation with injecting the context, and finally returns the result of the
 * operation.
 *
 * @deprecated This registry-backed API is retained solely so OLD published
 * `@aws-amplify/adapter-nextjs` versions (≤ 1.7.3, peer
 * `aws-amplify: ^6.16.4`) — which call it at runtime with cookie-backed
 * token/credentials providers in `libraryOptions` — keep working against this
 * version of `aws-amplify`. It will be removed in the next major version.
 *
 * The created context spec is a REAL branded `AmplifyContext` (structurally
 * compatible with the legacy `ContextSpec` shape), so operations may pass it
 * both to new context-first server APIs (e.g. `fetchAuthSession(contextSpec)`)
 * and to the deprecated `getAmplifyServerContext(contextSpec).amplify` lookup.
 * New code should build a context explicitly with `createAmplifyContext()`
 * (or use `@aws-amplify/adapter-nextjs`'s `createRunWithAmplifyServerContext`
 * for per-request isolation) instead.
 *
 * @param amplifyConfig The Amplify resource config.
 * @param libraryOptions The Amplify library options.
 * @param operation The operation to run with the server context created from
 *   `amplifyConfig` and `libraryOptions`.
 * @returns The result returned by the `operation`.
 */
export const runWithAmplifyServerContext: AmplifyServer.RunOperationWithContext =
	async (amplifyConfig, libraryOptions, operation) => {
		// Fail loud for untyped-JS callers passing the adapter-level
		// `{ nextServerContext, operation }` object shape (the signature of the
		// `runWithAmplifyServerContext` returned by `createServerRunner` in
		// `@aws-amplify/adapter-nextjs`, not of this function): silently treating
		// that object as a resource config would produce an unconfigured context
		// and fail far away from the call site.
		if (typeof operation !== 'function') {
			throw new AmplifyError({
				name: 'InvalidServerContextError',
				message:
					'`runWithAmplifyServerContext` from `aws-amplify/adapter-core` must be ' +
					'called as `runWithAmplifyServerContext(amplifyConfig, libraryOptions, operation)`. ' +
					'The `{ nextServerContext, operation }` object shape belongs to the ' +
					'function returned by `createServerRunner` in `@aws-amplify/adapter-nextjs`.',
				recoverySuggestion:
					'Use `createServerRunner`/`createRunWithAmplifyServerContext` from ' +
					'`@aws-amplify/adapter-nextjs` for request-scoped operations, or pass ' +
					'the config, library options, and operation as three arguments.',
			});
		}

		const contextSpec = createAmplifyServerContext(
			amplifyConfig,
			libraryOptions,
		);

		// run the operation with injecting the context
		try {
			const result = await operation(contextSpec);

			return result;
		} finally {
			// ensures destroy the context regardless whether the operation succeeded or failed
			destroyAmplifyServerContext(contextSpec);
		}
	};
