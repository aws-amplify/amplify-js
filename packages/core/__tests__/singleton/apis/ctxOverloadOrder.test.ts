// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable unused-imports/no-unused-vars */

import { fetchAuthSession } from '../../../src/singleton/apis/fetchAuthSession';
import { AmplifyContext } from '../../../src/context/AmplifyContext';
import { AuthSession } from '../../../src/singleton/Auth/types';

/**
 * Regression test for the e2e-discovered overload-order bug: TypeScript infers
 * the contextual type of an overloaded function VALUE from its LAST overload,
 * so the classic `fetchAuthSession(options?)` overload must be declared LAST
 * (after the `fetchAuthSession(ctx, options?)` overload) — otherwise callers
 * passing it as an `(opts?) => …` callback infer opts as `AmplifyContext`.
 */

// Mirrors a generic helper receiving fetchAuthSession in callback form.
function callWithOptions<T, R>(fn: (options?: T) => R, options: T): R {
	return fn(options);
}

describe('context overload declaration order', () => {
	// Type-only assertions: the enclosing arrow is never invoked, so nothing
	// executes at runtime; ts-jest type-checks this file at transform time.
	const typeOnly = (ctx: AmplifyContext) => {
		// Options must infer as FetchAuthSessionOptions, not AmplifyContext.
		const viaCallback: Promise<AuthSession> = callWithOptions(
			fetchAuthSession,
			{ forceRefresh: true },
		);

		// Direct calls must still resolve all forms.
		const classicNoArgs: Promise<AuthSession> = fetchAuthSession();
		const classicOptions: Promise<AuthSession> = fetchAuthSession({
			forceRefresh: true,
		});
		const ctxOnly: Promise<AuthSession> = fetchAuthSession(ctx);
		const ctxAndOptions: Promise<AuthSession> = fetchAuthSession(ctx, {
			forceRefresh: true,
		});
	};

	test('fetchAuthSession used as an (opts?) => … callback infers options type', () => {
		expect(typeOnly).toBeInstanceOf(Function);
	});
});
