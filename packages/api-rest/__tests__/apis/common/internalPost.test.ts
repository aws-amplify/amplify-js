// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { ApiError } from '@aws-amplify/core/internals/utils';
import {
	authenticatedHandler,
	getRetryDecider,
	parseJsonError,
	unauthenticatedHandler,
} from '@aws-amplify/core/internals/aws-client-utils';

import {
	cancel,
	post,
	updateRequestToBeCancellable,
} from '../../../src/apis/common/internalPost';
import { RestApiError, isCancelError } from '../../../src/errors';
import { parseRestApiServiceError } from '../../../src/utils';

jest.mock('@aws-amplify/core/internals/aws-client-utils');

const mockAuthenticatedHandler = authenticatedHandler as jest.Mock;
const mockUnauthenticatedHandler = unauthenticatedHandler as jest.Mock;
const mockParseJsonError = parseJsonError as jest.Mock;
const mockFetchAuthSession = jest.fn();
const mockAmplifyInstance = {
	Auth: {
		fetchAuthSession: mockFetchAuthSession,
	},
} as any as AmplifyClassV6;

const successResponse = {
	statusCode: 200,
	headers: {},
	body: {
		blob: jest.fn(),
		json: jest.fn(),
		text: jest.fn(),
	},
};
const apiGatewayUrl = new URL(
	'https://123.execute-api.us-west-2.amazonaws.com',
);
const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};

describe('internal post', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		mockFetchAuthSession.mockResolvedValue({ credentials });
		mockAuthenticatedHandler.mockResolvedValue(successResponse);
		mockUnauthenticatedHandler.mockResolvedValue(successResponse);
	});

	it('should call authenticatedHandler with specified region from signingServiceInfo', async () => {
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
			options: {
				signingServiceInfo: {
					region: 'us-east-1',
				},
			},
		});
		expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {},
			},
			expect.objectContaining({ region: 'us-east-1', service: 'execute-api' }),
		);
	});

	it('should call authenticatedHandler with specified service from signingServiceInfo', async () => {
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
			options: {
				signingServiceInfo: {
					service: 'lambda',
				},
			},
		});
		expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {},
			},
			expect.objectContaining({ region: 'us-west-2', service: 'lambda' }),
		);
	});

	it('should call authenticatedHandler for appsync-api service with default signing name', async () => {
		const appsyncApiEndpoint = new URL(
			'https://123.appsync-api.us-west-2.amazonaws.com/graphql',
		);
		await post(mockAmplifyInstance, {
			url: appsyncApiEndpoint,
			options: {
				signingServiceInfo: { region: 'us-east-1' },
			},
		});
		expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
			{
				url: appsyncApiEndpoint,
				method: 'POST',
				headers: {},
			},
			expect.objectContaining({ region: 'us-east-1', service: 'appsync' }),
		);
	});

	it('should call authenticatedHandler for appsync-api with specified service from signingServiceInfo', async () => {
		const appsyncApiEndpoint = new URL(
			'https://123.appsync-api.us-west-2.amazonaws.com/graphql',
		);
		await post(mockAmplifyInstance, {
			url: appsyncApiEndpoint,
			options: {
				signingServiceInfo: { service: 'appsync', region: 'us-east-1' },
			},
		});
		expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
			{
				url: appsyncApiEndpoint,
				method: 'POST',
				headers: {},
			},
			expect.objectContaining({ region: 'us-east-1', service: 'appsync' }),
		);
	});

	it('should call authenticatedHandler with empty signingServiceInfo', async () => {
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
			options: {
				signingServiceInfo: {},
			},
		});
		expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {},
			},
			expect.objectContaining({ region: 'us-west-2', service: 'execute-api' }),
		);
	});

	it('should use application/json content type if body is JSON', async () => {
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
			options: {
				body: { foo: 'bar' },
				signingServiceInfo: {},
			},
		});
		expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {
					'content-type': 'application/json; charset=UTF-8',
				},
				body: '{"foo":"bar"}',
			},
			expect.anything(),
		);
	});

	it('should unset content type if body is FormData', async () => {
		const formData = new FormData();
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
			options: {
				headers: {
					'content-type': 'some-value',
				},
				body: formData,
				signingServiceInfo: {},
			},
		});
		expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: expect.not.objectContaining({
					'content-type': expect.anything(),
				}),
				body: formData,
			},
			expect.anything(),
		);
	});

	it('should call unauthenticatedHandler without signingServiceInfo', async () => {
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
		});
		expect(mockUnauthenticatedHandler).toHaveBeenCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {},
			},
			expect.anything(),
		);
	});

	it('should call unauthenticatedHandler with custom x-api-key header and signingServiceInfo', async () => {
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
			options: {
				headers: {
					'x-api-key': '123',
				},
				signingServiceInfo: {},
			},
		});
		expect(mockUnauthenticatedHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: {
					'x-api-key': '123',
				},
			}),
			expect.anything(),
		);
		expect(mockAuthenticatedHandler).not.toHaveBeenCalled();
	});

	it('should call unauthenticatedHandler with custom authorization header and signingServiceInfo', async () => {
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
			options: {
				headers: {
					Authorization: '123',
				},
				signingServiceInfo: {},
			},
		});
		expect(mockUnauthenticatedHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: {
					authorization: '123',
				},
			}),
			expect.anything(),
		);
		expect(mockAuthenticatedHandler).not.toHaveBeenCalled();
	});

	it('should call unauthenticatedHandler if credential is not set', async () => {
		mockFetchAuthSession.mockClear();
		mockFetchAuthSession.mockRejectedValue(
			new Error('Mock error as credentials not configured'),
		);
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
		});
		expect(mockUnauthenticatedHandler).toHaveBeenCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {},
			},
			expect.anything(),
		);
		expect(mockAuthenticatedHandler).not.toHaveBeenCalled();
	});

	it('should abort request when cancel is called', async () => {
		expect.assertions(4);
		let underLyingHandlerReject;
		mockUnauthenticatedHandler.mockReset();
		mockUnauthenticatedHandler.mockReturnValue(
			new Promise((_resolve, reject) => {
				underLyingHandlerReject = reject;
			}),
		);
		const abortController = new AbortController();
		const promise = post(mockAmplifyInstance, {
			url: apiGatewayUrl,
			abortController,
		});
		updateRequestToBeCancellable(promise, abortController);

		// mock abort behavior
		const abortSignal = abortController.signal;
		abortSignal.addEventListener('abort', () => {
			const mockAbortError = new Error('AbortError');
			mockAbortError.name = 'AbortError';
			underLyingHandlerReject(mockAbortError);
		});

		const cancelMessage = 'cancelMessage';
		const canceled = cancel(promise, cancelMessage);
		expect(canceled).toBe(true);
		try {
			await promise;
			fail('should throw cancel error');
		} catch (error: any) {
			expect(abortSignal.aborted).toBe(true);
			expect(isCancelError(error)).toBe(true);
			expect(error.message).toBe(cancelMessage);
		}
	});

	it('should throw RestApiError when error response conforms to AWS service errors', async () => {
		expect.assertions(4);
		const errorResponseObj = { message: 'fooMessage', name: 'badRequest' };
		const errorResponse = {
			statusCode: 400,
			headers: {},
			body: {
				blob: jest.fn(),
				json: jest.fn(),
				text: jest.fn().mockResolvedValue(JSON.stringify(errorResponseObj)),
			},
		};
		mockParseJsonError.mockImplementationOnce(async response => {
			const errorResponsePayload = await response.body?.json();
			const error = new Error(errorResponsePayload.message);

			return Object.assign(error, {
				name: errorResponsePayload.name,
			});
		});
		mockUnauthenticatedHandler.mockResolvedValueOnce(errorResponse);
		try {
			await post(mockAmplifyInstance, {
				url: apiGatewayUrl,
			});
			fail('should throw RestApiError');
		} catch (error) {
			expect(mockParseJsonError).toHaveBeenCalledWith({
				...errorResponse,
				body: {
					json: expect.any(Function),
					blob: expect.any(Function),
					text: expect.any(Function),
				},
			});
			expect(error).toEqual(expect.any(RestApiError));
			expect(error).toEqual(expect.any(ApiError));
			expect((error as ApiError).response).toEqual({
				statusCode: 400,
				headers: {},
				body: JSON.stringify(errorResponseObj),
			});
		}
	});

	it('should throw when error response has custom payload', async () => {
		expect.assertions(4);
		const errorResponseStr = 'custom error message';
		const errorResponse = {
			statusCode: 400,
			headers: {},
			body: {
				blob: jest.fn(),
				json: jest.fn(),
				text: jest.fn().mockResolvedValue(errorResponseStr),
			},
		};
		mockParseJsonError.mockImplementationOnce(async response => {
			const errorResponsePayload = await response.body?.json();
			const error = new Error(errorResponsePayload.message);

			return Object.assign(error, {
				name: errorResponsePayload.name,
			});
		});
		mockUnauthenticatedHandler.mockResolvedValueOnce(errorResponse);
		try {
			await post(mockAmplifyInstance, {
				url: apiGatewayUrl,
			});
			fail('should throw RestApiError');
		} catch (error) {
			expect(mockParseJsonError).toHaveBeenCalledWith({
				...errorResponse,
				body: {
					json: expect.any(Function),
					blob: expect.any(Function),
					text: expect.any(Function),
				},
			});
			expect(error).toEqual(expect.any(RestApiError));
			expect(error).toEqual(expect.any(ApiError));
			expect((error as ApiError).response).toEqual({
				statusCode: 400,
				headers: {},
				body: errorResponseStr,
			});
		}
	});

	it('should use jittered-exponential-backoff retry strategy', async () => {
		const mockRetryDecider = jest.fn();
		(getRetryDecider as jest.Mock).mockReturnValue(mockRetryDecider);
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
			options: {
				signingServiceInfo: {},
			},
		});

		expect(getRetryDecider).toHaveBeenCalledWith(parseRestApiServiceError);
		expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ retryDecider: mockRetryDecider }),
		);
	});
	it('should use jittered-exponential-backoff retry strategy, even when configuring using library options', async () => {
		const mockRetryDecider = jest.fn();
		(getRetryDecider as jest.Mock).mockReturnValue(mockRetryDecider);
		const mockAmplifyInstanceWithNoRetry = {
			...mockAmplifyInstance,
			retryStrategy: {
				strategy: 'no-retry',
			},
		} as any as AmplifyClassV6;
		await post(mockAmplifyInstanceWithNoRetry, {
			url: apiGatewayUrl,
			options: {
				signingServiceInfo: {},
			},
		});

		expect(getRetryDecider).toHaveBeenCalledWith(parseRestApiServiceError);
		expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ retryDecider: mockRetryDecider }),
		);
	});
});
