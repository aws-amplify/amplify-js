// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AMPLIFY_CONTEXT_BRAND } from '../../src';
import { assertOptionalCtxArg } from '../../src/context/assertCtxArg';
import {
	AmplifyError,
	INVALID_AMPLIFY_CONTEXT_ERROR_NAME,
	InvalidAmplifyContextError,
} from '../../src/errors';
import { AmplifyContext } from '../../src/context/AmplifyContext';

function makeBrandedContext(): AmplifyContext {
	const ctx = {
		resourcesConfig: {},
		libraryOptions: {},
		fetchAuthSession: jest.fn(),
		clearCredentials: jest.fn(),
		getTokens: jest.fn(),
	};
	Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, { value: true });

	return ctx as unknown as AmplifyContext;
}

describe('assertOptionalCtxArg', () => {
	it('does not throw when the value is undefined', () => {
		expect(() => {
			assertOptionalCtxArg(undefined);
		}).not.toThrow();
	});

	it('does not throw when the value is a branded AmplifyContext', () => {
		expect(() => {
			assertOptionalCtxArg(makeBrandedContext());
		}).not.toThrow();
	});

	it('throws a typed InvalidAmplifyContextError for a plain object', () => {
		expect(() => {
			assertOptionalCtxArg({ resourcesConfig: {} });
		}).toThrow(InvalidAmplifyContextError);
	});

	it('throws for a context-shaped but unbranded object', () => {
		const unbranded = {
			resourcesConfig: {},
			libraryOptions: {},
			fetchAuthSession: jest.fn(),
			clearCredentials: jest.fn(),
			getTokens: jest.fn(),
		};
		expect(() => {
			assertOptionalCtxArg(unbranded);
		}).toThrow(InvalidAmplifyContextError);
	});

	it('throws for primitive non-undefined values', () => {
		expect(() => {
			assertOptionalCtxArg('not-a-context');
		}).toThrow(InvalidAmplifyContextError);
	});

	it('thrown error carries the stable name and is an AmplifyError', () => {
		let caught: unknown;
		try {
			assertOptionalCtxArg({});
		} catch (error) {
			caught = error;
		}
		expect(caught).toBeInstanceOf(AmplifyError);
		expect((caught as InvalidAmplifyContextError).name).toBe(
			INVALID_AMPLIFY_CONTEXT_ERROR_NAME,
		);
	});
});
