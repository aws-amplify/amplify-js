// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * The server-context registry (createAmplifyServerContext /
 * destroyAmplifyServerContext) was removed in the context migration. The
 * deprecated `runWithAmplifyServerContext` shim now simply resolves the current
 * global `AmplifyContext` and invokes the operation with it. These tests
 * exercise that behavior against the REAL core global context.
 */
import { getGlobalContext, isAmplifyContext } from '@aws-amplify/core';
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

describe('runWithAmplifyServerContext (deprecated shim)', () => {
	beforeEach(() => {
		clearGlobalContext();
		Amplify.configure(mockResourceConfig);
	});

	afterEach(() => {
		clearGlobalContext();
	});

	it('runs the operation with the branded global AmplifyContext', async () => {
		const mockOperation = jest.fn();

		await runWithAmplifyServerContext({ operation: mockOperation });

		expect(mockOperation).toHaveBeenCalledTimes(1);
		const passedContext = mockOperation.mock.calls[0][0];
		expect(passedContext).toBe(getGlobalContext());
		expect(isAmplifyContext(passedContext)).toBe(true);
	});

	it('accepts an explicit `nextServerContext: null`', async () => {
		const mockOperation = jest.fn();

		await runWithAmplifyServerContext({
			nextServerContext: null,
			operation: mockOperation,
		});

		expect(mockOperation).toHaveBeenCalledWith(getGlobalContext());
	});

	it('returns the result returned by the operation callback', async () => {
		const mockResultValue = { url: 'http://123.com' };
		const mockOperation = jest.fn(() => Promise.resolve(mockResultValue));

		const result = await runWithAmplifyServerContext({
			operation: mockOperation,
		});

		expect(result).toStrictEqual(mockResultValue);
	});

	it('propagates errors thrown by the operation', async () => {
		const testError = new Error('some error');
		const mockOperation = jest.fn(() => Promise.reject(testError));

		await expect(
			runWithAmplifyServerContext({ operation: mockOperation }),
		).rejects.toThrow(testError);
	});

	describe('legacy request-scoped `nextServerContext` shape (fail-loud)', () => {
		// Mimics an untyped-JS caller still passing the removed
		// `{ nextServerContext: { request, response }, operation }` shape.
		const legacyCall = (nextServerContext: unknown) =>
			runWithAmplifyServerContext({
				nextServerContext,
				operation: jest.fn(),
			} as unknown as Parameters<typeof runWithAmplifyServerContext>[0]);

		it('throws a typed InvalidServerContextError instead of leaking the global context', async () => {
			expect.assertions(3);
			try {
				await legacyCall({ request: {}, response: {} });
			} catch (error) {
				expect(error).toBeInstanceOf(AmplifyError);
				expect((error as AmplifyError).name).toBe('InvalidServerContextError');
				expect((error as AmplifyError).recoverySuggestion).toContain(
					'createRunWithAmplifyServerContext',
				);
			}
		});

		it('does not invoke the operation when the legacy shape is passed', async () => {
			const mockOperation = jest.fn();

			await expect(
				runWithAmplifyServerContext({
					nextServerContext: { request: {}, response: {} },
					operation: mockOperation,
				} as unknown as Parameters<typeof runWithAmplifyServerContext>[0]),
			).rejects.toMatchObject({ name: 'InvalidServerContextError' });

			expect(mockOperation).not.toHaveBeenCalled();
		});
	});
});
