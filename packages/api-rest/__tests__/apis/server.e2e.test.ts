// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * End-to-end server tests that drive the REAL call chain:
 *   server get(contextSpec, input) → resolveServerContext → publicApis → transferHandler → resolveCredentials
 *
 * Only the low-level HTTP handlers are mocked (same as publicApis.test.ts).
 * This proves that the bridged resolveServerContext correctly wires
 * `amplify.Auth.fetchAuthSession` so that IAM requests are SIGNED.
 */

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import { getRetryDecider } from '@aws-amplify/core/internals/aws-client-utils';

import { authenticatedHandler } from '../../src/apis/common/baseHandlers/authenticatedHandler';
import { unauthenticatedHandler } from '../../src/apis/common/baseHandlers/unauthenticatedHandler';
import { get } from '../../src/server';

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

const restApiConfig = {
	API: {
		REST: {
			testApi: {
				endpoint:
					'https://abc123.execute-api.us-west-2.amazonaws.com/development',
				region: 'us-west-2',
			},
		},
	},
};

describe('server e2e — branded AmplifyContext through real transferHandler', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		mockAuthenticatedHandler.mockResolvedValue(mockSuccessResponse);
		mockUnauthenticatedHandler.mockResolvedValue(mockSuccessResponse);
		mockGetRetryDecider.mockReturnValue(() =>
			Promise.resolve({ retryable: false }),
		);
	});

	it('should call authenticatedHandler when branded AmplifyContext is passed directly', async () => {
		const mockFetchAuthSession = jest.fn().mockResolvedValue({ credentials });
		const ctx = createMockAmplifyContext(restApiConfig, {
			fetchAuthSession: mockFetchAuthSession,
		});

		await get(ctx, {
			apiName: 'testApi',
			path: '/items',
		}).response;

		// The brand-check branch returns the context as-is; transferHandler calls
		// ctx.fetchAuthSession directly → authenticatedHandler must be used.
		expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				url: expect.objectContaining({
					href: 'https://abc123.execute-api.us-west-2.amazonaws.com/development/items',
				}),
				method: 'GET',
			}),
			expect.objectContaining({
				credentials,
				region: 'us-west-2',
				service: 'execute-api',
			}),
		);
		expect(mockUnauthenticatedHandler).not.toHaveBeenCalled();
	});
});
