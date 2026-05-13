// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AMPLIFY_CONTEXT_BRAND } from '../../src';
import {
	clearGlobalContext,
	resolveCtxArgs,
	setGlobalContext,
} from '../../src/libraryUtils';
import { AmplifyContext } from '../../src/context/AmplifyContext';

function makeBrandedContext(
	overrides?: Partial<AmplifyContext>,
): AmplifyContext {
	const ctx = {
		resourcesConfig: {},
		libraryOptions: {},
		fetchAuthSession: jest.fn(),
		clearCredentials: jest.fn(),
		getTokens: jest.fn(),
		...overrides,
	};
	Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, { value: true });

	return ctx as unknown as AmplifyContext;
}

describe('resolveCtxArgs', () => {
	afterEach(() => {
		clearGlobalContext();
	});

	describe('when first arg is a branded AmplifyContext', () => {
		it('returns [ctx, secondArg] tuple', () => {
			const ctx = makeBrandedContext();
			const input = { username: 'test' };
			const [resolved, opts] = resolveCtxArgs([ctx, input]);
			expect(resolved).toBe(ctx);
			expect(opts).toBe(input);
		});

		it('works when second arg is undefined', () => {
			const ctx = makeBrandedContext();
			const [resolved, opts] = resolveCtxArgs([ctx, undefined]);
			expect(resolved).toBe(ctx);
			expect(opts).toBeUndefined();
		});
	});

	describe('when first arg is NOT a context', () => {
		it('falls back to getActiveContext and treats first arg as input', () => {
			const globalCtx = makeBrandedContext();
			setGlobalContext(globalCtx);
			const input = { username: 'test' };
			const [resolved, opts] = resolveCtxArgs([input]);
			expect(resolved).toBe(globalCtx);
			expect(opts).toBe(input);
		});

		it('throws if no global context is set', () => {
			expect(() => resolveCtxArgs([{ username: 'test' }])).toThrow(
				'No AmplifyContext available',
			);
		});
	});

	describe('when first arg is explicitly undefined with args.length > 1', () => {
		it('throws a specific error about undefined context', () => {
			expect(() => resolveCtxArgs([undefined, { username: 'test' }])).toThrow(
				'Undefined AmplifyContext passed',
			);
		});
	});

	describe('edge cases', () => {
		it('does NOT throw when args is [undefined] (length === 1)', () => {
			setGlobalContext(makeBrandedContext());
			const [resolved, opts] = resolveCtxArgs([undefined]);
			expect(resolved).toBeDefined();
			expect(opts).toBeUndefined();
		});

		it('handles empty args array — falls back to global context', () => {
			const globalCtx = makeBrandedContext();
			setGlobalContext(globalCtx);
			const [resolved, opts] = resolveCtxArgs([]);
			expect(resolved).toBe(globalCtx);
			expect(opts).toBeUndefined();
		});
	});

	describe('multi-arg scenarios', () => {
		it('returns all remaining args when context is first', () => {
			const ctx = makeBrandedContext();
			const [resolved, a, b] = resolveCtxArgs([ctx, 'arg1', 'arg2']);
			expect(resolved).toBe(ctx);
			expect(a).toBe('arg1');
			expect(b).toBe('arg2');
		});

		it('returns all args as rest when no context provided', () => {
			const globalCtx = makeBrandedContext();
			setGlobalContext(globalCtx);
			const [resolved, a, b] = resolveCtxArgs(['arg1', 'arg2']);
			expect(resolved).toBe(globalCtx);
			expect(a).toBe('arg1');
			expect(b).toBe('arg2');
		});
	});
});
