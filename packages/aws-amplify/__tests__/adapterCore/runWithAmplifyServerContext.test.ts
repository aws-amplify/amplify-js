// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * The deprecated `runWithAmplifyServerContext` shim restores the exact
 * published v6 `aws-amplify/adapter-core` signature —
 * `(amplifyConfig, libraryOptions, operation)` — backed by the restored
 * registry trio (`createAmplifyServerContext` / `getAmplifyServerContext` /
 * `destroyAmplifyServerContext`), solely so OLD published
 * `@aws-amplify/adapter-nextjs` versions (≤ 1.7.3) keep working. These tests
 * exercise the REAL shims end-to-end (no mocked internals).
 */
import { getGlobalContext, isAmplifyContext } from '@aws-amplify/core';
import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';
import {
	AmplifyError,
	clearGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { runWithAmplifyServerContext } from '../../src/adapter-core';
import { Amplify } from '../../src';

const mockResourceConfig = {
	Auth: {
		Cognito: {
			userPoolClientId: 'userPoolClientId',
			userPoolId: 'userPoolId',
		},
	},
};

describe('runWithAmplifyServerContext (deprecated registry shim)', () => {
	beforeEach(() => {
		clearGlobalContext();
		Amplify.configure(mockResourceConfig);
	});

	afterEach(() => {
		clearGlobalContext();
	});

	it('runs the operation with a fresh, isolated, branded AmplifyContext (not the global one)', async () => {
		const mockOperation = jest.fn();

		await runWithAmplifyServerContext(mockResourceConfig, {}, mockOperation);

		expect(mockOperation).toHaveBeenCalledTimes(1);
		const passedContext = mockOperation.mock.calls[0][0];
		expect(isAmplifyContext(passedContext)).toBe(true);
		// Per-call isolation: NOT the process-wide global context.
		expect(passedContext).not.toBe(getGlobalContext());
		expect(passedContext.resourcesConfig).toEqual(mockResourceConfig);
	});

	it('creates a distinct context per invocation', async () => {
		const specs: unknown[] = [];
		const operation = (contextSpec: unknown) => {
			specs.push(contextSpec);
		};

		await runWithAmplifyServerContext(mockResourceConfig, {}, operation);
		await runWithAmplifyServerContext(mockResourceConfig, {}, operation);

		expect(specs[0]).not.toBe(specs[1]);
	});

	it('returns the result returned by the operation callback', async () => {
		const mockResultValue = { url: 'http://123.com' };
		const mockOperation = jest.fn(() => Promise.resolve(mockResultValue));

		const result = await runWithAmplifyServerContext(
			mockResourceConfig,
			{},
			mockOperation,
		);

		expect(result).toStrictEqual(mockResultValue);
	});

	it('propagates errors thrown by the operation', async () => {
		const testError = new Error('some error');
		const mockOperation = jest.fn(() => Promise.reject(testError));

		await expect(
			runWithAmplifyServerContext(mockResourceConfig, {}, mockOperation),
		).rejects.toThrow(testError);
	});

	it('registers the context for the duration of the operation and destroys it afterwards', async () => {
		let capturedSpec: Parameters<typeof getAmplifyServerContext>[0] | undefined;

		await runWithAmplifyServerContext(mockResourceConfig, {}, contextSpec => {
			capturedSpec = contextSpec;
			// While the operation runs, the legacy lookup resolves.
			expect(getAmplifyServerContext(contextSpec).amplify).toBeDefined();
		});

		// After the operation completes, the context has been destroyed.
		// NOTE: `instanceof AmplifyServerContextError` has never worked — the
		// `AmplifyError` base resets the prototype (es5 transpilation hack) — so,
		// like all published consumers, we assert on the error message/name.
		expect(() => getAmplifyServerContext(capturedSpec!)).toThrow(
			'Attempted to get the Amplify Server Context that may have been destroyed.',
		);
	});

	it('destroys the context even when the operation throws', async () => {
		let capturedSpec: Parameters<typeof getAmplifyServerContext>[0] | undefined;

		await expect(
			runWithAmplifyServerContext(mockResourceConfig, {}, contextSpec => {
				capturedSpec = contextSpec;
				throw new Error('operation failed');
			}),
		).rejects.toThrow('operation failed');

		// NOTE: `instanceof AmplifyServerContextError` has never worked — the
		// `AmplifyError` base resets the prototype (es5 transpilation hack) — so,
		// like all published consumers, we assert on the error message/name.
		expect(() => getAmplifyServerContext(capturedSpec!)).toThrow(
			'Attempted to get the Amplify Server Context that may have been destroyed.',
		);
	});

	describe('legacy `getAmplifyServerContext(spec).amplify` reverse bridge', () => {
		it('exposes the AmplifyClass surface old consumers touch, delegating to the context', async () => {
			await runWithAmplifyServerContext(
				mockResourceConfig,
				{},
				async contextSpec => {
					const { amplify } = getAmplifyServerContext(contextSpec);

					// The bridge is itself a valid branded context, so new
					// context-first internals accept it without re-bridging.
					expect(isAmplifyContext(amplify)).toBe(true);
					// Legacy AmplifyClass members.
					expect(amplify.getConfig()).toBe(contextSpec.resourcesConfig);
					expect(amplify.libraryOptions).toBe(contextSpec.libraryOptions);
					expect(typeof amplify.Auth.fetchAuthSession).toBe('function');
					// Unsupported legacy member fails loud with a typed error.
					expect(() => amplify.configure()).toThrow(
						'`configure()` is not supported on a server context',
					);
				},
			);
		});

		it('rejects a malformed contextSpec with the original descriptive error', () => {
			expect(() =>
				getAmplifyServerContext(
					{} as Parameters<typeof getAmplifyServerContext>[0],
				),
			).toThrow('Invalid `contextSpec`.');
		});
	});

	describe('object-shape misuse (fail-loud)', () => {
		// Mimics an untyped-JS caller passing the ADAPTER-level
		// `{ nextServerContext, operation }` shape to this function.
		const legacyCall = () =>
			(
				runWithAmplifyServerContext as unknown as (
					input: unknown,
				) => Promise<unknown>
			)({
				nextServerContext: { request: {}, response: {} },
				operation: jest.fn(),
			});

		it('throws a typed InvalidServerContextError instead of misreading the input', async () => {
			expect.assertions(3);
			try {
				await legacyCall();
			} catch (error) {
				expect(error).toBeInstanceOf(AmplifyError);
				expect((error as AmplifyError).name).toBe('InvalidServerContextError');
				expect((error as AmplifyError).recoverySuggestion).toContain(
					'createServerRunner',
				);
			}
		});
	});
});
