// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ApiError } from '../../src/errors/APIError';

describe('ApiError', () => {
	it('creates error without response', () => {
		const error = new ApiError({
			name: 'TestError',
			message: 'Test message',
		});
		expect(error.name).toBe('TestError');
		expect(error.message).toBe('Test message');
		expect(error.response).toBeUndefined();
	});

	it('creates error with response', () => {
		const response = {
			statusCode: 404,
			headers: { 'content-type': 'application/json' },
			body: '{"error":"Not found"}',
		};
		const error = new ApiError({
			name: 'NotFoundError',
			message: 'Resource not found',
			response,
		});
		expect(error.response).toEqual(response);
		expect(error.response).not.toBe(response);
		expect(error.response?.headers).not.toBe(response.headers);
	});

	it('replicates response to prevent mutation', () => {
		const response = {
			statusCode: 500,
			headers: { 'x-custom': 'value' },
		};
		const error = new ApiError({
			name: 'ServerError',
			message: 'Server error',
			response,
		});
		const errorResponse = error.response;
		response.headers['x-custom'] = 'modified';
		expect(errorResponse?.headers['x-custom']).toBe('value');
	});
});
