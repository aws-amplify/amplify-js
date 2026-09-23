// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable unused-imports/no-unused-vars */

import { AmplifyContext } from '@aws-amplify/core';

import { remove } from '../../../../src/providers/s3/apis/remove';
import {
	RemoveInput,
	RemoveOperation,
	RemoveOutput,
	RemoveWithPathOutput,
} from '../../../../src/providers/s3/types';

/**
 * Regression test for the e2e-discovered overload-order bug: TypeScript infers
 * the contextual type of an overloaded function VALUE from its LAST overload,
 * so the classic `fn(input)` overloads must be declared LAST (after the
 * `fn(ctx, input)` overloads) — otherwise generic helpers receiving storage
 * APIs as callbacks infer the input as `AmplifyContext`.
 */

type Expect<T extends true> = T;
type Equal<X, Y> =
	(<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
		? true
		: false;

/** The input type contextual typing sees for a single-argument callback. */
type InferredInput<F> = F extends (input: infer I) => unknown ? I : never;

// Mirrors sample apps' generic helper receiving APIs as callbacks.
function callApi<T, R>(fn: (input: T) => R, input: T): R {
	return fn(input);
}

describe('context overload declaration order', () => {
	// Type-only assertions: the enclosing arrow is never invoked, so nothing
	// executes at runtime; ts-jest type-checks this file at transform time.
	const typeOnly = (ctx: AmplifyContext) => {
		// The LAST overload is the classic (deprecated key-based) input form,
		// matching pre-context v6 declaration order — NOT AmplifyContext.
		type InferenceCase = Expect<
			Equal<InferredInput<typeof remove>, RemoveInput>
		>;

		// remove passed as callback must compile and produce the operation type.
		const removedByKey: RemoveOperation<RemoveOutput> = callApi(remove, {
			key: 'photo.jpg',
		});

		// Direct calls must still resolve all four forms.
		const classicPath: RemoveOperation<RemoveWithPathOutput> = remove({
			path: 'public/photo.jpg',
		});
		const classicKey: RemoveOperation<RemoveOutput> = remove({
			key: 'photo.jpg',
		});
		const ctxPath: RemoveOperation<RemoveWithPathOutput> = remove(ctx, {
			path: 'public/photo.jpg',
		});
		const ctxKey: RemoveOperation<RemoveOutput> = remove(ctx, {
			key: 'photo.jpg',
		});
	};

	test('remove used as a single-input callback infers the v6 input type', () => {
		expect(typeOnly).toBeInstanceOf(Function);
	});
});
