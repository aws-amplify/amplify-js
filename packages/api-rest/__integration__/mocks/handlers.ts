// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse, delay, http } from 'msw';

/**
 * Mock handlers for REST API requests
 */
export const handlers = [
	// GET - List items
	http.get('https://api.example.com/items', ({ request }) => {
		// Allow unauthenticated for basic tests, but validate if auth headers present
		const apiKey = request.headers.get('x-api-key');
		const authorization = request.headers.get('authorization');

		// If auth headers are provided, validate them
		if (apiKey && apiKey !== 'test-api-key-12345') {
			return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
		}

		if (authorization && !authorization.startsWith('Bearer ')) {
			return HttpResponse.json(
				{ error: 'Invalid authorization header' },
				{ status: 401 },
			);
		}

		return HttpResponse.json({
			items: [
				{ id: '1', name: 'Item 1' },
				{ id: '2', name: 'Item 2' },
			],
		});
	}),

	// GET - Single item by ID
	http.get('https://api.example.com/items/:id', ({ params, request }) => {
		const { id } = params;

		if (id === 'nonexistent') {
			return new HttpResponse(null, { status: 404 });
		}

		// Validate auth if provided
		const apiKey = request.headers.get('x-api-key');
		if (apiKey && apiKey !== 'test-api-key-12345') {
			return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
		}

		return HttpResponse.json({
			id,
			name: `Item ${id}`,
			description: 'Mock item description',
		});
	}),

	// GET - Slow endpoint for cancellation testing
	http.get('https://api.example.com/items/slow', async () => {
		await delay(5000);

		return HttpResponse.json({ data: 'slow response' });
	}),

	// POST - Create item
	http.post('https://api.example.com/items', async ({ request }) => {
		// Validate auth if provided
		const apiKey = request.headers.get('x-api-key');
		const authorization = request.headers.get('authorization');

		if (apiKey && apiKey !== 'test-api-key-12345') {
			return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
		}

		if (authorization && !authorization.startsWith('Bearer ')) {
			return HttpResponse.json(
				{ error: 'Invalid authorization header' },
				{ status: 401 },
			);
		}

		const body = (await request.json()) as Record<string, unknown>;

		return HttpResponse.json(
			{
				id: 'new-item-id',
				...body,
				createdAt: new Date().toISOString(),
			},
			{ status: 201 },
		);
	}),

	// POST - Action endpoint (no body required)
	http.post('https://api.example.com/items/action', () => {
		return HttpResponse.json({ success: true });
	}),

	// POST - Invalid endpoint for error testing
	http.post('https://api.example.com/items/invalid', () => {
		return HttpResponse.json({ error: 'Validation failed' }, { status: 400 });
	}),

	// POST - Slow endpoint for cancellation testing
	http.post('https://api.example.com/items/slow', async () => {
		await delay(5000);

		return HttpResponse.json({ data: 'slow response' });
	}),

	// POST - Create user (complex nested object)
	http.post('https://api.example.com/users', async ({ request }) => {
		const body = (await request.json()) as Record<string, unknown>;

		return HttpResponse.json(
			{
				id: 'new-user-id',
				...body,
				createdAt: new Date().toISOString(),
			},
			{ status: 201 },
		);
	}),

	// PUT - Update item
	http.put('https://api.example.com/items/:id', async ({ params, request }) => {
		const { id } = params;

		if (id === 'nonexistent') {
			return new HttpResponse(null, { status: 404 });
		}

		// Validate auth if provided
		const apiKey = request.headers.get('x-api-key');
		const authorization = request.headers.get('authorization');

		if (apiKey && apiKey !== 'test-api-key-12345') {
			return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
		}

		if (authorization && !authorization.startsWith('Bearer ')) {
			return HttpResponse.json(
				{ error: 'Invalid authorization header' },
				{ status: 401 },
			);
		}

		const body = (await request.json()) as Record<string, unknown>;

		return HttpResponse.json({
			id,
			...body,
			updatedAt: new Date().toISOString(),
		});
	}),

	// PUT - Slow endpoint for cancellation testing
	http.put('https://api.example.com/items/slow', async () => {
		await delay(5000);

		return HttpResponse.json({ data: 'slow response' });
	}),

	// PATCH - Partial update
	http.patch(
		'https://api.example.com/items/:id',
		async ({ params, request }) => {
			const { id } = params;

			if (id === 'nonexistent') {
				return new HttpResponse(null, { status: 404 });
			}

			// Validate auth if provided
			const apiKey = request.headers.get('x-api-key');
			const authorization = request.headers.get('authorization');

			if (apiKey && apiKey !== 'test-api-key-12345') {
				return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
			}

			if (authorization && !authorization.startsWith('Bearer ')) {
				return HttpResponse.json(
					{ error: 'Invalid authorization header' },
					{ status: 401 },
				);
			}

			const body = (await request.json()) as Record<string, unknown>;

			return HttpResponse.json({
				id,
				name: 'Existing Name',
				description: 'Existing Description',
				...body,
				updatedAt: new Date().toISOString(),
			});
		},
	),

	// PATCH - Slow endpoint for cancellation testing
	http.patch('https://api.example.com/items/slow', async () => {
		await delay(5000);

		return HttpResponse.json({ data: 'slow response' });
	}),

	// DELETE - Delete item
	http.delete('https://api.example.com/items/:id', ({ params, request }) => {
		const { id } = params;

		if (id === 'nonexistent') {
			return new HttpResponse(null, { status: 404 });
		}

		// Validate auth if provided
		const apiKey = request.headers.get('x-api-key');
		const authorization = request.headers.get('authorization');

		if (apiKey && apiKey !== 'test-api-key-12345') {
			return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
		}

		if (authorization && !authorization.startsWith('Bearer ')) {
			return HttpResponse.json(
				{ error: 'Invalid authorization header' },
				{ status: 401 },
			);
		}

		return HttpResponse.json({
			message: `Item ${id} deleted successfully`,
		});
	}),

	// HEAD - Check resource existence
	http.head('https://api.example.com/items/:id', ({ params, request }) => {
		const { id } = params;

		if (id === 'nonexistent') {
			return new HttpResponse(null, { status: 404 });
		}

		// Validate auth if provided
		const apiKey = request.headers.get('x-api-key');
		const authorization = request.headers.get('authorization');

		if (apiKey && apiKey !== 'test-api-key-12345') {
			return new HttpResponse(null, { status: 401 });
		}

		if (authorization && !authorization.startsWith('Bearer ')) {
			return new HttpResponse(null, { status: 401 });
		}

		return new HttpResponse(null, {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': '123',
				'Last-Modified': new Date().toUTCString(),
			},
		});
	}),
];
