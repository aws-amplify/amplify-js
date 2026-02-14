// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { isCancelError, put } from '../src';

describe('PUT Integration Tests', () => {
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

	it('should update an existing item', async () => {
		const updatedItem = {
			name: 'Updated Item',
			description: 'Updated description',
		};

		const response = await put({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				body: updatedItem,
			},
		}).response;

		const data = await response.body.json();

		expect(response.statusCode).toBe(200);
		expect(data).toMatchObject({
			id: '123',
			name: 'Updated Item',
			description: 'Updated description',
		});
		expect(data.updatedAt).toBeDefined();
	});

	it('should update with custom headers', async () => {
		const response = await put({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				body: { name: 'Test' },
				headers: {
					'If-Match': 'etag-value',
					'X-Update-Source': 'api',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	it('should update with query parameters', async () => {
		const response = await put({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				body: { name: 'Updated' },
				queryParams: {
					validate: 'true',
					notify: 'false',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	it('should handle partial updates', async () => {
		const response = await put({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				body: { name: 'Only Name Updated' },
			},
		}).response;

		const data = await response.body.json();

		expect(response.statusCode).toBe(200);
		expect(data.name).toBe('Only Name Updated');
	});

	it('should cancel a PUT request', async () => {
		const { response, cancel } = put({
			apiName: 'example-api',
			path: '/items/slow',
			options: {
				body: { name: 'Test' },
			},
		});

		cancel('Cancelled by user');

		try {
			await response;
			throw new Error('Should have thrown a cancel error');
		} catch (error) {
			expect(isCancelError(error)).toBe(true);
		}
	});

	it('should handle 404 for non-existent resource', async () => {
		try {
			await put({
				apiName: 'example-api',
				path: '/items/nonexistent',
				options: {
					body: { name: 'Test' },
				},
			}).response;
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.response.statusCode).toBe(404);
		}
	});

	it('should replace entire resource', async () => {
		const completeItem = {
			name: 'Complete Item',
			description: 'Full description',
			category: 'electronics',
			price: 99.99,
			inStock: true,
		};

		const response = await put({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				body: completeItem,
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	describe('Authentication scenarios', () => {
		it('should make PUT request with API key', async () => {
			const response = await put({
				apiName: 'example-api',
				path: '/items/123',
				options: {
					body: { name: 'Updated' },
					headers: {
						'x-api-key': 'test-api-key-12345',
					},
				},
			}).response;

			expect(response.statusCode).toBe(200);
		});

		it('should make PUT request with authorization header', async () => {
			const response = await put({
				apiName: 'example-api',
				path: '/items/123',
				options: {
					body: { name: 'Updated' },
					headers: {
						Authorization: 'Bearer token123',
					},
				},
			}).response;

			expect(response.statusCode).toBe(200);
		});
	});
});
