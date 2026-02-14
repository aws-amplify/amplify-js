// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { head } from '../src';

describe('HEAD Integration Tests', () => {
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

	it('should check resource existence with HEAD request', async () => {
		const response = await head({
			apiName: 'example-api',
			path: '/items/123',
		}).response;

		expect(response.statusCode).toBe(200);
		expect(response.headers).toBeDefined();
	});

	it('should return headers without body', async () => {
		const response = await head({
			apiName: 'example-api',
			path: '/items/123',
		}).response;

		expect(response.statusCode).toBe(200);
		expect(response.headers['content-type']).toBe('application/json');
		expect(response.headers['content-length']).toBe('123');
		expect(response.headers['last-modified']).toBeDefined();
	});

	it('should handle 404 for non-existent resource', async () => {
		try {
			await head({
				apiName: 'example-api',
				path: '/items/nonexistent',
			}).response;
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.response.statusCode).toBe(404);
		}
	});

	it('should send custom headers with HEAD request', async () => {
		const response = await head({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				headers: {
					'X-Custom-Header': 'value',
					Accept: 'application/json',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	it('should send query parameters with HEAD request', async () => {
		const response = await head({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				queryParams: {
					version: '2',
					include: 'metadata',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	it('should combine headers and query params', async () => {
		const response = await head({
			apiName: 'example-api',
			path: '/items/123',
			options: {
				headers: {
					'If-None-Match': 'etag-value',
				},
				queryParams: {
					checksum: 'true',
				},
			},
		}).response;

		expect(response.statusCode).toBe(200);
	});

	describe('Authentication scenarios', () => {
		it('should make HEAD request with API key', async () => {
			const response = await head({
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

		it('should make HEAD request with authorization header', async () => {
			const response = await head({
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
