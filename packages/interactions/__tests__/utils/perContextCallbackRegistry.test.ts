// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import { createPerContextCallbackRegistry } from '../../src/utils/perContextCallbackRegistry';

describe('createPerContextCallbackRegistry', () => {
	it('returns a registered callback for the same context and name', () => {
		const registry = createPerContextCallbackRegistry<() => void>();
		const ctx = createMockAmplifyContext();
		const callback = jest.fn();

		registry.set(ctx, 'BotA', callback);

		expect(registry.get(ctx, 'BotA')).toBe(callback);
	});

	it('returns undefined for an unregistered (ctx, name) pair', () => {
		const registry = createPerContextCallbackRegistry<() => void>();
		const ctx = createMockAmplifyContext();

		expect(registry.get(ctx, 'BotA')).toBeUndefined();

		registry.set(ctx, 'BotA', jest.fn());

		expect(registry.get(ctx, 'BotB')).toBeUndefined();
	});

	it('isolates callbacks between different contexts', () => {
		const registry = createPerContextCallbackRegistry<() => void>();
		const ctxA = createMockAmplifyContext();
		const ctxB = createMockAmplifyContext();
		const callbackA = jest.fn();
		const callbackB = jest.fn();

		registry.set(ctxA, 'BotA', callbackA);
		registry.set(ctxB, 'BotA', callbackB);

		// Same bot name, different contexts — each context resolves its own
		// callback and never the other's (context isolation).
		expect(registry.get(ctxA, 'BotA')).toBe(callbackA);
		expect(registry.get(ctxB, 'BotA')).toBe(callbackB);
	});

	it('replaces an existing callback for the same context and name', () => {
		const registry = createPerContextCallbackRegistry<() => void>();
		const ctx = createMockAmplifyContext();
		const first = jest.fn();
		const second = jest.fn();

		registry.set(ctx, 'BotA', first);
		registry.set(ctx, 'BotA', second);

		expect(registry.get(ctx, 'BotA')).toBe(second);
	});

	it('supports multiple bot names under the same context', () => {
		const registry = createPerContextCallbackRegistry<() => void>();
		const ctx = createMockAmplifyContext();
		const callbackA = jest.fn();
		const callbackB = jest.fn();

		registry.set(ctx, 'BotA', callbackA);
		registry.set(ctx, 'BotB', callbackB);

		expect(registry.get(ctx, 'BotA')).toBe(callbackA);
		expect(registry.get(ctx, 'BotB')).toBe(callbackB);
	});
});
