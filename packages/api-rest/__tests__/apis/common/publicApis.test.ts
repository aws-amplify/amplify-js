// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	authenticatedHandler,
	unauthenticatedHandler,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';

import {
	get,
	post,
	put,
	del,
	head,
	patch,
} from '../../../src/apis/common/publicApis';
import {
	RestApiError,
	isCancelError,
	validationErrorMap,
	RestApiValidationErrorCode,
} from '../../../src/errors';

jest.mock('@aws-amplify/core/internals/aws-client-utils');

const mockAuthenticatedHandler = authenticatedHandler as jest.Mock;
const mockUnauthenticatedHandler = unauthenticatedHandler as jest.Mock;
const mockFetchAuthSession = jest.fn();
let mockConfig = {
	API: {
		REST: {
			restApi1: {
				endpoint: 'https://123.execute-api.us-west-2.amazonaws.com/development',
				region: 'us-west-2',
			},
			invalidEndpoint: {
				endpoint: '123',
			},
		},
	},
};
const mockParseJsonError = parseJsonError as jest.Mock;
const mockRestHeaders = jest.fn();
const mockGetConfig = jest.fn();
const mockAmplifyInstance = {
	Auth: {
		fetchAuthSession: mockFetchAuthSession,
	},
	getConfig: mockGetConfig,
	libraryOptions: {
		API: {
			REST: {
				headers: mockRestHeaders,
			},
		},
	},
} as any as AmplifyClassV6;
const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const mockSuccessResponse = {
	statusCode: 200,
	headers: {
		'response-header': 'response-header-value',
	},
	body: {
		blob: jest.fn(),
		json: jest.fn(),
		text: jest.fn(),
	},
};

describe('public APIs', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		mockFetchAuthSession.mockResolvedValue({
			credentials,
		});
		mockSuccessResponse.body.json.mockResolvedValue({ foo: 'bar' });
		mockAuthenticatedHandler.mockResolvedValue(mockSuccessResponse);
		mockUnauthenticatedHandler.mockResolvedValue(mockSuccessResponse);
		mockGetConfig.mockReturnValue(mockConfig);
	});
	const APIs = [
		{ name: 'get', fn: get, method: 'GET' },
		{ name: 'post', fn: post, method: 'POST' },
		{ name: 'put', fn: put, method: 'PUT' },
		{ name: 'del', fn: del, method: 'DELETE' },
		{ name: 'head', fn: head, method: 'HEAD' },
		{ name: 'patch', fn: patch, method: 'PATCH' },
	];
	// TODO: use describe.each after upgrading Jest
	APIs.forEach(({ name, fn, method }) => {
		describe(name, () => {
			it('should call authenticatedHandler with specified region from signingServiceInfo', async () => {
				const response = await fn(mockAmplifyInstance, {
					apiName: 'restApi1',
					path: '/items',
					options: {
						withCredentials: true,
					},
				}).response;
				expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
					{
						url: new URL(
							'https://123.execute-api.us-west-2.amazonaws.com/development/items'
						),
						method,
						headers: {},
						body: undefined,
					},
					expect.objectContaining({
						region: 'us-west-2',
						service: 'execute-api',
						withCrossDomainCredentials: true,
					})
				);
				expect(response.headers).toEqual({
					'response-header': 'response-header-value',
				});
				expect(response.statusCode).toBe(200);
				if (fn !== head && fn !== del) {
					// @ts-ignore HEAD and DELETE does not have a response body.
					expect(await response.body.json()).toEqual({ foo: 'bar' });
				}
			});

			it('should support custom headers from library options', async () => {
				mockRestHeaders.mockResolvedValue({
					'custom-header': 'custom-value',
				});
				await fn(mockAmplifyInstance, {
					apiName: 'restApi1',
					path: '/items',
				}).response;
				expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
					{
						url: new URL(
							'https://123.execute-api.us-west-2.amazonaws.com/development/items'
						),
						method,
						headers: {
							'custom-header': 'custom-value',
						},
						body: undefined,
					},
					expect.objectContaining({
						region: 'us-west-2',
						service: 'execute-api',
					})
				);
			});

			it('should support headers options', async () => {
				await fn(mockAmplifyInstance, {
					apiName: 'restApi1',
					path: '/items',
					options: {
						headers: {
							'custom-header': 'custom-value',
						},
					},
				}).response;
				expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
					{
						url: new URL(
							'https://123.execute-api.us-west-2.amazonaws.com/development/items'
						),
						method,
						headers: {
							'custom-header': 'custom-value',
						},
						body: undefined,
					},
					expect.objectContaining({
						region: 'us-west-2',
						service: 'execute-api',
					})
				);
			});

			it('should support path parameters', async () => {
				await fn(mockAmplifyInstance, {
					apiName: 'restApi1',
					path: '/items/123',
				}).response;
				expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
					expect.objectContaining({
						url: new URL(
							'https://123.execute-api.us-west-2.amazonaws.com/development/items/123'
						),
					}),
					expect.anything()
				);
			});

			it('should support queryParams options', async () => {
				await fn(mockAmplifyInstance, {
					apiName: 'restApi1',
					path: '/items',
					options: {
						queryParams: {
							param1: 'value1',
						},
					},
				}).response;
				expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
					expect.objectContaining({
						url: expect.objectContaining({
							href: 'https://123.execute-api.us-west-2.amazonaws.com/development/items?param1=value1',
						}),
					}),
					expect.anything()
				);
			});

			it('should support query parameters in path', async () => {
				await fn(mockAmplifyInstance, {
					apiName: 'restApi1',
					path: '/items?param1=value1',
					options: {
						queryParams: {
							foo: 'bar',
						},
					},
				}).response;
				expect(mockAuthenticatedHandler).toHaveBeenCalledWith(
					expect.objectContaining({
						url: expect.objectContaining({
							href: 'https://123.execute-api.us-west-2.amazonaws.com/development/items?param1=value1&foo=bar',
						}),
					}),
					expect.anything()
				);
			});

			it('should throw if apiName is not configured', async () => {
				expect.assertions(2);
				try {
					await fn(mockAmplifyInstance, {
						apiName: 'nonExistentApi',
						path: '/items',
					}).response;
				} catch (error) {
					expect(error).toBeInstanceOf(RestApiError);
					expect(error).toMatchObject(
						validationErrorMap[RestApiValidationErrorCode.InvalidApiName]
					);
				}
			});

			it('should throw if resolve URL is not valid', async () => {
				expect.assertions(2);
				try {
					await fn(mockAmplifyInstance, {
						apiName: 'invalidEndpoint',
						path: '/items',
					}).response;
				} catch (error) {
					expect(error).toBeInstanceOf(RestApiError);
					expect(error).toMatchObject({
						...validationErrorMap[RestApiValidationErrorCode.InvalidApiName],
						recoverySuggestion: expect.stringContaining(
							'Please make sure the REST endpoint URL is a valid URL string.'
						),
					});
				}
			});

			it('should use unauthenticated request if credentials are not available', async () => {
				expect.assertions(1);
				mockFetchAuthSession.mockResolvedValueOnce({});
				await fn(mockAmplifyInstance, {
					apiName: 'restApi1',
					path: '/items',
				}).response;
				expect(mockUnauthenticatedHandler).toHaveBeenCalledWith(
					expect.objectContaining({
						url: new URL(
							'https://123.execute-api.us-west-2.amazonaws.com/development/items/123'
						),
					}),
					expect.anything()
				);
			});

			it('should throw when response is not ok', async () => {
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
				mockAuthenticatedHandler.mockResolvedValueOnce(errorResponse);
				try {
					await fn(mockAmplifyInstance, {
						apiName: 'restApi1',
						path: '/items',
					}).response;
					fail('should throw RestApiError');
				} catch (error) {
					expect(mockParseJsonError).toHaveBeenCalledWith(errorResponse);
					expect(error).toEqual(expect.any(RestApiError));
				}
			});

			it('should support cancel', async () => {
				expect.assertions(2);
				const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
				let underLyingHandlerReject;
				mockAuthenticatedHandler.mockReset();
				mockAuthenticatedHandler.mockReturnValue(
					new Promise((_, reject) => {
						underLyingHandlerReject = reject;
					})
				);
				abortSpy.mockImplementation(() => {
					const mockAbortError = new Error('AbortError');
					mockAbortError.name = 'AbortError';
					underLyingHandlerReject(mockAbortError);
				});

				const { response, cancel } = fn(mockAmplifyInstance, {
					apiName: 'restApi1',
					path: '/items',
				});
				const cancelMessage = 'cancelMessage';
				try {
					setTimeout(() => {
						cancel(cancelMessage);
					});
					await response;
					fail('should throw cancel error');
				} catch (error: any) {
					expect(isCancelError(error)).toBe(true);
					expect(error.message).toBe(cancelMessage);
				}
			});
		});
	});
});
