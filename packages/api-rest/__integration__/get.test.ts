// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { get, isCancelError } from '../src';

describe('GET Integration Tests', () => {
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

	it('should fetch data with basic GET request', async () => {
		const response = await get({
			apiName: 'example-api',
			path: '/items',
		}).response;

		const data = await response.body.json();

		expect(response.statusCode).toBe(200);
		expect(data).toEqual({
			items: [
				{ id: '1', name: 'Item 1' },
				{ id: '2', name: 'Item 2' },
			],
		});
	});

	it('should fetch data with query parameters', async () => {
		const response = await get({
			apiName: 'example-api',
			path: '/items',
			options: {
				queryParams: {
					limit: '10',
					offset: '0',
					filter: 'active',
				},
			},
		}).response;

		const data = await response.body.json();

		expect(response.statusCode).toBe(200);
		expect(data).toBeDefined();
	});

	it('should fetch data with custom headers', async () => {
		const response = await get({
			apiName: 'example-api',
			path: '/items',
			options: {
				headers: {
					'X-Custom-Header': 'custom-value',
					Accept: 'application/json',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	it('should fetch a single item by id', async () => {
		const response = await get({
			apiName: 'example-api',
			path: '/items/123',
		}).response;

		const data = await response.body.json();

		expect(response.statusCode).toBe(200);
		expect(data).toEqual({
			id: '123',
			name: 'Item 123',
			description: 'Mock item description',
		});
	});

	it('should handle 404 not found', async () => {
		try {
			await get({
				apiName: 'example-api',
				path: '/items/nonexistent',
			}).response;
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.response.statusCode).toBe(404);
		}
	});

	it('should cancel a GET request', async () => {
		const { response, cancel } = get({
			apiName: 'example-api',
			path: '/items/slow',
		});

		// Cancel immediately
		cancel('User cancelled request');

		try {
			await response;
			throw new Error('Should have thrown a cancel error');
		} catch (error) {
			expect(isCancelError(error)).toBe(true);
			if (isCancelError(error)) {
				expect(error.message).toContain('cancelled');
			}
		}
	});

	it('should combine query params and headers', async () => {
		const response = await get({
			apiName: 'example-api',
			path: '/items',
			options: {
				queryParams: {
					category: 'electronics',
				},
				headers: {
					'x-api-key': 'test-api-key-12345',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	describe('Authentication scenarios', () => {
		it('should make request with API key authentication', async () => {
			const response = await get({
				apiName: 'example-api',
				path: '/items',
				options: {
					headers: {
						'x-api-key': 'test-api-key-12345',
					},
				},
			}).response;

			expect(response.statusCode).toBe(200);
		});

		it('should make request with authorization header (Cognito/OIDC)', async () => {
			const response = await get({
				apiName: 'example-api',
				path: '/items',
				options: {
					headers: {
						Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
					},
				},
			}).response;

			expect(response.statusCode).toBe(200);
		});
	});
});
