// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	authenticatedHandler,
	unauthenticatedHandler,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';

import { post, cancel } from '../../src/common/internalPost';
import { RestApiError, isCancelError } from '../../src/errors';

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
	'https://123.execute-api.us-west-2.amazonaws.com'
);
const credentials = {};

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
		expect(mockAuthenticatedHandler).toBeCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {},
			},
			expect.objectContaining({ region: 'us-east-1', service: 'execute-api' })
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
		expect(mockAuthenticatedHandler).toBeCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {},
			},
			expect.objectContaining({ region: 'us-west-2', service: 'lambda' })
		);
	});
	it('should call authenticatedHandler with empty signingServiceInfo', async () => {
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
			options: {
				signingServiceInfo: {},
			},
		});
		expect(mockAuthenticatedHandler).toBeCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {},
			},
			expect.objectContaining({ region: 'us-west-2', service: 'execute-api' })
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
		expect(mockAuthenticatedHandler).toBeCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {
					'content-type': 'application/json; charset=UTF-8',
				},
				body: '{"foo":"bar"}',
			},
			expect.anything()
		);
	});

	it('should use multipart/form-data content type if body is FormData', async () => {
		const formData = new FormData();
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
			options: {
				body: formData,
				signingServiceInfo: {},
			},
		});
		expect(mockAuthenticatedHandler).toBeCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {
					'content-type': 'multipart/form-data',
				},
				body: formData,
			},
			expect.anything()
		);
	});

	it('should call unauthenticatedHandler without signingServiceInfo', async () => {
		await post(mockAmplifyInstance, {
			url: apiGatewayUrl,
		});
		expect(mockUnauthenticatedHandler).toBeCalledWith(
			{
				url: apiGatewayUrl,
				method: 'POST',
				headers: {},
			},
			expect.anything()
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
		expect(mockUnauthenticatedHandler).toBeCalledWith(
			expect.objectContaining({
				headers: {
					'x-api-key': '123',
				},
			}),
			expect.anything()
		);
		expect(mockAuthenticatedHandler).not.toBeCalled();
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
		expect(mockUnauthenticatedHandler).toBeCalledWith(
			expect.objectContaining({
				headers: {
					authorization: '123',
				},
			}),
			expect.anything()
		);
		expect(mockAuthenticatedHandler).not.toBeCalled();
	});

	it('should abort request when cancel is called', async () => {
		expect.assertions(4);
		let underLyingHandlerReject;
		mockUnauthenticatedHandler.mockReset();
		mockUnauthenticatedHandler.mockReturnValue(
			new Promise((_, reject) => {
				underLyingHandlerReject = reject;
			})
		);
		const promise = post(mockAmplifyInstance, {
			url: apiGatewayUrl,
		});

		// mock abort behavior
		const abortSignal = mockUnauthenticatedHandler.mock.calls[0][1]
			.abortSignal as AbortSignal;
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
		} catch (error) {
			expect(abortSignal.aborted).toBe(true);
			expect(isCancelError(error)).toBe(true);
			expect(error.message).toBe(cancelMessage);
		}
	});

	it('should throw RestApiError when response is not ok', async () => {
		expect.assertions(2);
		const errorResponse = {
			statusCode: 400,
			headers: {},
			body: {
				blob: jest.fn(),
				json: jest.fn(),
				text: jest.fn(),
			},
		};
		mockParseJsonError.mockResolvedValueOnce(
			new RestApiError({ message: 'fooMessage', name: 'badRequest' })
		);
		mockUnauthenticatedHandler.mockResolvedValueOnce(errorResponse);
		try {
			await post(mockAmplifyInstance, {
				url: apiGatewayUrl,
			});
			fail('should throw RestApiError');
		} catch (error) {
			expect(mockParseJsonError).toBeCalledWith(errorResponse);
			expect(error).toEqual(expect.any(RestApiError));
		}
	});
});
