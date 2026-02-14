// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { del } from '../src';

describe('DELETE Integration Tests', () => {
	beforeAll(() => {
		Amplify.configure({
			API: {
				REST: {
					'example-api': {
						endpoint: 'https://api.example.com',
						region: 'us-east-1',
					},
				},
			},
		});
	});

	afterAll(() => {
		Amplify.configure({});
	});

	it('should delete an item', async () => {
		const response = await del({
			apiName: 'example-api',
			path: '/items/123',
		}).response;

		const data = await response.body.json();

		expect(response.statusCode).toBe(200);
		expect(data).toEqual({
			message: 'Item 123 deleted successfully',
		});
	});

	it('should delete with custom headers', async () => {
		const response = await del({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				headers: {
					'X-Delete-Reason': 'cleanup',
					Authorization: 'Bearer token',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	it('should delete with query parameters', async () => {
		const response = await del({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				queryParams: {
					force: 'true',
					cascade: 'false',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	it('should handle 404 for non-existent resource', async () => {
		try {
			await del({
				apiName: 'example-api',
				path: '/items/nonexistent',
			}).response;
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.response.statusCode).toBe(404);
		}
	});

	it('should delete with both headers and query params', async () => {
		const response = await del({
			apiName: 'example-api',
			path: '/items/456',
			options: {
				headers: {
					'X-Request-Id': 'req-123',
				},
				queryParams: {
					soft: 'true',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	describe('Authentication scenarios', () => {
		it('should make DELETE request with API key', async () => {
			const response = await del({
				apiName: 'example-api',
				path: '/items/123',
				options: {
					headers: {
						'x-api-key': 'test-api-key-12345',
					},
				},
			}).response;

			expect(response.statusCode).toBe(200);
		});

		it('should make DELETE request with authorization header', async () => {
			const response = await del({
				apiName: 'example-api',
				path: '/items/123',
				options: {
					headers: {
						Authorization: 'Bearer token123',
					},
				},
			}).response;

			expect(response.statusCode).toBe(200);
		});
	});
});
