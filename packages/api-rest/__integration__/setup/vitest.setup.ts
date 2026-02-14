// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from '../mocks/server';

// Enable API mocking before all tests
beforeAll(() => {
	server.listen({
		onUnhandledRequest: 'warn',
	});
});

// Reset any request handlers between tests
afterEach(() => {
	server.resetHandlers();
});

// Restore native request-issuing modules after all tests
afterAll(() => {
	server.close();
});

// Optional: Log intercepted requests for debugging
if (process.env.DEBUG_MSW) {
	server.events.on('request:start', ({ request }) => {
		// eslint-disable-next-line no-console
		console.log('MSW intercepted:', request.method, request.url);
	});
}
