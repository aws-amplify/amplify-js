// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AMPLIFY_CONTEXT_BRAND,
	getGlobalContext,
	hasGlobalContext,
} from '../../src';
import { clearGlobalContext, setGlobalContext } from '../../src/libraryUtils';
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

describe('globalContext', () => {
	afterEach(() => {
		clearGlobalContext();
	});

	describe('hasGlobalContext', () => {
		it('returns false before any context is set', () => {
			expect(hasGlobalContext()).toBe(false);
		});

		it('returns true after setGlobalContext', () => {
			setGlobalContext(makeBrandedContext());
			expect(hasGlobalContext()).toBe(true);
		});

		it('returns false after clearGlobalContext', () => {
			setGlobalContext(makeBrandedContext());
			clearGlobalContext();
			expect(hasGlobalContext()).toBe(false);
		});
	});

	describe('getGlobalContext', () => {
		it('throws when no context is set', () => {
			expect(() => getGlobalContext()).toThrow('No AmplifyContext available');
		});

		it('returns the context set by setGlobalContext', () => {
			const ctx = makeBrandedContext();
			setGlobalContext(ctx);
			expect(getGlobalContext()).toBe(ctx);
		});

		it('returns the most recently set context (overwrite)', () => {
			const ctx1 = makeBrandedContext();
			const ctx2 = makeBrandedContext();
			setGlobalContext(ctx1);
			setGlobalContext(ctx2);
			expect(getGlobalContext()).toBe(ctx2);
		});
	});

	describe('setGlobalContext', () => {
		it('stores the context for retrieval', () => {
			const ctx = makeBrandedContext();
			setGlobalContext(ctx);
			expect(getGlobalContext()).toBe(ctx);
		});

		it('accepts any object as AmplifyContext (no runtime brand check)', () => {
			const unbranded = { resourcesConfig: {} } as any;
			setGlobalContext(unbranded);
			expect(getGlobalContext()).toBe(unbranded);
		});
	});

	describe('clearGlobalContext', () => {
		it('removes the stored context', () => {
			setGlobalContext(makeBrandedContext());
			clearGlobalContext();
			expect(hasGlobalContext()).toBe(false);
		});

		it('is idempotent — calling twice does not throw', () => {
			clearGlobalContext();
			expect(() => {
				clearGlobalContext();
			}).not.toThrow();
		});
	});
});
