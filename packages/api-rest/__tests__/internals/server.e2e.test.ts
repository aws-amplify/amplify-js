// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * End-to-end server tests that drive the REAL call chain:
 *   internals server post(contextSpec, input) → resolveServerContext → internalPost → transferHandler → resolveCredentials
 *
 * Only the low-level HTTP handlers are mocked (same as apis/server.e2e.test.ts).
 * This proves that the bridged resolveServerContext correctly brands the context
 * so that internalPost's `isAmplifyContext` check passes without double-bridging,
 * and `amplify.Auth.fetchAuthSession` resolves credentials for IAM signing.
 */

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import { getRetryDecider } from '@aws-amplify/core/internals/aws-client-utils';

import { authenticatedHandler } from '../../src/apis/common/baseHandlers/authenticatedHandler';
import { unauthenticatedHandler } from '../../src/apis/common/baseHandlers/unauthenticatedHandler';
import { post } from '../../src/internals/server';

jest.mock('@aws-amplify/core/internals/aws-client-utils');
jest.mock('../../src/apis/common/baseHandlers/authenticatedHandler');
jest.mock('../../src/apis/common/baseHandlers/unauthenticatedHandler');

const mockAuthenticatedHandler = authenticatedHandler as jest.Mock;
const mockUnauthenticatedHandler = unauthenticatedHandler as jest.Mock;
const mockGetRetryDecider = jest.mocked(getRetryDecider);

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};

const mockSuccessResponse = {
	statusCode: 200,
	headers: { 'x-amzn-requestid': '1234' },
	body: {
		blob: jest.fn(),
		json: jest.fn().mockResolvedValue({ ok: true }),
		text: jest.fn().mockResolvedValue(''),
	},
};

describe('internals/server e2e — branded AmplifyContext through real internalPost + transferHandler', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		mockAuthenticatedHandler.mockResolvedValue(mockSuccessResponse);
		mockUnauthenticatedHandler.mockResolvedValue(mockSuccessResponse);
		mockGetRetryDecider.mockReturnValue(() =>
			Promise.resolve({ retryable: false }),
		);
	});

	it('should call authenticatedHandler when branded AmplifyContext is passed directly to internals post', async () => {
		const mockFetchAuthSession = jest.fn().mockResolvedValue({ credentials });
		const ctx = createMockAmplifyContext(
			{},
			{ fetchAuthSession: mockFetchAuthSession },
		);

		const appsyncUrl = new URL(
			'https://abc123.appsync-api.us-west-2.amazonaws.com/graphql',
		);

		await post(ctx, {
			url: appsyncUrl,
			options: {
				signingServiceInfo: {
					service: 'appsync',
					region: 'us-west-2',
				},
			},
		});

		// The brand-check branch in resolveServerContext returns the context as-is;
		// internalPost also recognizes it → no bridging → transferHandler calls
		// ctx.fetchAuthSession directly → authenticatedHandler must be used.
		expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				url: appsyncUrl,
				method: 'POST',
			}),
			expect.objectContaining({
				credentials,
				region: 'us-west-2',
				service: 'appsync',
			}),
		);
		expect(mockUnauthenticatedHandler).not.toHaveBeenCalled();
	});
});
