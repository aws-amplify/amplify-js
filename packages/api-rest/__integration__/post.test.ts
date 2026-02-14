// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { isCancelError, post } from '../src';

describe('POST Integration Tests', () => {
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

	it('should create a new item with JSON body', async () => {
		const newItem = {
			name: 'New Item',
			description: 'A new test item',
		};

		const response = await post({
			apiName: 'example-api',
			path: '/items',
			options: {
				body: newItem,
			},
		}).response;

		const data = (await response.body.json()) as any;

		expect(response.statusCode).toBe(201);
		expect(data).toMatchObject({
			id: 'new-item-id',
			name: 'New Item',
			description: 'A new test item',
		});
		expect(data.createdAt).toBeDefined();
	});

	it('should post with custom headers', async () => {
		const response = await post({
			apiName: 'example-api',
			path: '/items',
			options: {
				body: { name: 'Test' },
				headers: {
					'Content-Type': 'application/json',
					'X-Custom-Header': 'value',
				},
			},
		}).response;

		expect(response.statusCode).toBe(201);
	});

	it('should post with query parameters', async () => {
		const response = await post({
			apiName: 'example-api',
			path: '/items',
			options: {
				body: { name: 'Test' },
				queryParams: {
					notify: 'true',
					source: 'api',
				},
			},
		}).response;

		expect(response.statusCode).toBe(201);
	});

	it('should post with empty body', async () => {
		const response = await post({
			apiName: 'example-api',
			path: '/items/action',
		}).response;

		expect(response.statusCode).toBe(200);
	});

	it('should cancel a POST request', async () => {
		const { response, cancel } = post({
			apiName: 'example-api',
			path: '/items/slow',
			options: {
				body: { name: 'Test' },
			},
		});

		cancel('User cancelled');

		try {
			await response;
			throw new Error('Should have thrown a cancel error');
		} catch (error) {
			expect(isCancelError(error)).toBe(true);
		}
	});

	it('should post complex nested object', async () => {
		const complexData = {
			user: {
				name: 'John Doe',
				email: 'john@example.com',
				preferences: {
					theme: 'dark',
					notifications: true,
				},
			},
			items: ['item1', 'item2', 'item3'],
		};

		const response = await post({
			apiName: 'example-api',
			path: '/users',
			options: {
				body: complexData,
			},
		}).response;

		expect(response.statusCode).toBe(201);
	});

	it('should handle validation errors', async () => {
		try {
			await post({
				apiName: 'example-api',
				path: '/items/invalid',
				options: {
					body: { invalid: 'data' },
				},
			}).response;
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.response.statusCode).toBe(400);
		}
	});

	describe('Authentication scenarios', () => {
		it('should make POST request with API key', async () => {
			const response = await post({
				apiName: 'example-api',
				path: '/items',
				options: {
					body: { name: 'Test Item' },
					headers: {
						'x-api-key': 'test-api-key-12345',
					},
				},
			}).response;

			expect(response.statusCode).toBe(201);
		});

		it('should make POST request with authorization header', async () => {
			const response = await post({
				apiName: 'example-api',
				path: '/items',
				options: {
					body: { name: 'Test Item' },
					headers: {
						Authorization: 'Bearer token123',
					},
				},
			}).response;

			expect(response.statusCode).toBe(201);
		});
	});
});
