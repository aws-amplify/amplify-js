// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { isCancelError, patch } from '../src';

describe('PATCH Integration Tests', () => {
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

	it('should partially update an item', async () => {
		const partialUpdate = {
			name: 'Patched Name',
		};

		const response = await patch({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				body: partialUpdate,
			},
		}).response;

		const data = await response.body.json();

		expect(response.statusCode).toBe(200);
		expect(data.name).toBe('Patched Name');
		expect(data.id).toBe('123');
	});

	it('should patch with custom headers', async () => {
		const response = await patch({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				body: { status: 'active' },
				headers: {
					'Content-Type': 'application/json',
					'X-Patch-Version': '1.0',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	it('should patch with query parameters', async () => {
		const response = await patch({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				body: { priority: 'high' },
				queryParams: {
					reason: 'urgent',
					notifyOwner: 'true',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	it('should patch multiple fields', async () => {
		const updates = {
			name: 'Updated Name',
			description: 'Updated Description',
			status: 'active',
		};

		const response = await patch({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				body: updates,
			},
		}).response;

		const data = await response.body.json();

		expect(response.statusCode).toBe(200);
		expect(data).toMatchObject(updates);
	});

	it('should cancel a PATCH request', async () => {
		const { response, cancel } = patch({
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

	it('should handle nested object updates', async () => {
		const nestedUpdate = {
			metadata: {
				lastModified: new Date().toISOString(),
				modifiedBy: 'user123',
			},
		};

		const response = await patch({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				body: nestedUpdate,
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	it('should handle 404 for non-existent resource', async () => {
		try {
			await patch({
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

	describe('Authentication scenarios', () => {
		it('should make PATCH request with API key', async () => {
			const response = await patch({
				apiName: 'example-api',
				path: '/items/123',
				options: {
					body: { status: 'active' },
					headers: {
						'x-api-key': 'test-api-key-12345',
					},
				},
			}).response;

			expect(response.statusCode).toBe(200);
		});

		it('should make PATCH request with authorization header', async () => {
			const response = await patch({
				apiName: 'example-api',
				path: '/items/123',
				options: {
					body: { status: 'active' },
					headers: {
						Authorization: 'Bearer token123',
					},
				},
			}).response;

			expect(response.statusCode).toBe(200);
		});
	});
});
