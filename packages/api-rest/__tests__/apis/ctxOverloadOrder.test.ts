// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable unused-imports/no-unused-vars */

import { AmplifyContext } from '@aws-amplify/core';

import { del, get, head, patch, post, put } from '../../src';
import {
	DeleteInput,
	DeleteOperation,
	GetInput,
	GetOperation,
	HeadInput,
	HeadOperation,
	PatchInput,
	PatchOperation,
	PostInput,
	PostOperation,
	PutInput,
	PutOperation,
} from '../../src/types';

/**
 * Regression test for the e2e-discovered overload-order bug
 * (integ_react_rest_api): TypeScript infers the contextual type of an
 * overloaded function VALUE from its LAST overload. Sample apps pass the REST
 * verbs into generic helpers like `callApi(fn: (input: T) => Op, input)`, so
 * the classic `fn(input)` overload must be declared LAST (and the
 * `fn(ctx, input)` overload FIRST) — otherwise `T` infers as `AmplifyContext`
 * and the sample fails with TS2345.
 */

type Expect<T extends true> = T;
type Equal<X, Y> =
	(<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
		? true
		: false;

/** The input type contextual typing sees for a single-argument callback. */
type InferredInput<F> = F extends (input: infer I) => unknown ? I : never;

// Mirrors the sample apps' generic helper receiving API verbs as callbacks.
function callApi<T, R>(fn: (input: T) => R, input: T): R {
	return fn(input);
}

describe('context overload declaration order', () => {
	// Type-only assertions: the enclosing arrow is never invoked, so nothing
	// executes at runtime; ts-jest type-checks this file at transform time.
	const typeOnly = (ctx: AmplifyContext) => {
		const input = { apiName: 'restApi', path: '/items' };

		// Contextual typing must infer the v6 input type, not AmplifyContext.
		type InferenceCases = [
			Expect<Equal<InferredInput<typeof get>, GetInput>>,
			Expect<Equal<InferredInput<typeof post>, PostInput>>,
			Expect<Equal<InferredInput<typeof put>, PutInput>>,
			Expect<Equal<InferredInput<typeof del>, DeleteInput>>,
			Expect<Equal<InferredInput<typeof head>, HeadInput>>,
			Expect<Equal<InferredInput<typeof patch>, PatchInput>>,
		];

		// Verbs passed as callbacks must compile and produce the operation type.
		const getOp: GetOperation = callApi(get, input);
		const postOp: PostOperation = callApi(post, input);
		const putOp: PutOperation = callApi(put, input);
		const delOp: DeleteOperation = callApi(del, input);
		const headOp: HeadOperation = callApi(head, input);
		const patchOp: PatchOperation = callApi(patch, input);

		// Direct calls must still resolve both forms.
		const classicCall: GetOperation = get(input);
		const ctxCall: GetOperation = get(ctx, input);
	};

	test('REST verbs used as single-input callbacks infer the v6 input type', () => {
		expect(typeOnly).toBeInstanceOf(Function);
	});
});
