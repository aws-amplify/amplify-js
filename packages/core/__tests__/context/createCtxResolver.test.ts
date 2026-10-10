// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createCtxResolver } from '../../src/context/createCtxResolver';
import {
	clearGlobalContext,
	setGlobalContext,
} from '../../src/context/globalContext';
import { NoAmplifyContextError } from '../../src/errors';
import { createMockAmplifyContext } from '../../src/testing';

describe('createCtxResolver', () => {
	afterEach(() => {
		clearGlobalContext();
	});

	it('resolves the explicit context when one was passed', () => {
		const explicitCtx = createMockAmplifyContext();
		const globalCtx = createMockAmplifyContext();
		setGlobalContext(globalCtx);

		const resolve = createCtxResolver(explicitCtx);

		expect(resolve()).toBe(explicitCtx);
	});

	it('falls back to the global context when no explicit ctx was passed', () => {
		const globalCtx = createMockAmplifyContext();
		setGlobalContext(globalCtx);

		const resolve = createCtxResolver();

		expect(resolve()).toBe(globalCtx);
	});

	it('resolves the global context FRESH per call (no stale capture across setGlobalContext)', () => {
		const firstCtx = createMockAmplifyContext();
		const secondCtx = createMockAmplifyContext();
		setGlobalContext(firstCtx);

		// Resolver created (e.g. in a provider constructor) while the first
		// global context is active...
		const resolve = createCtxResolver();
		expect(resolve()).toBe(firstCtx);

		// ...must observe the replacement after a reconfigure, since
		// configure() swaps out the frozen global context object wholesale.
		setGlobalContext(secondCtx);
		expect(resolve()).toBe(secondCtx);
	});

	it('propagates NoAmplifyContextError when resolved pre-configure', () => {
		const resolve = createCtxResolver();

		// Creating the resolver must NOT throw (lazy resolution)...
		expect(() => resolve()).toThrow(NoAmplifyContextError);
	});

	it('does not throw at creation time even without any context', () => {
		expect(() => createCtxResolver()).not.toThrow();
	});
});
