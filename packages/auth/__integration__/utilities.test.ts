// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '../src';

import { mockUser } from './mocks/handlers';

describe('Utility Functions Integration Tests', () => {
	describe('decodeJWT', () => {
		it('should successfully decode a valid JWT token', () => {
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMzQ1IiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.4Adcj0pW6hGnT5bCz0FnXqBfXJfKs5wXb4FnXqBfXJc';

			const decoded = decodeJWT(token);

			expect(decoded.payload.sub).toBe(mockUser.userId);
			expect(decoded.payload.name).toBe(mockUser.name);
		});

		it('should decode token and return payload', () => {
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMzQ1IiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.4Adcj0pW6hGnT5bCz0FnXqBfXJfKs5wXb4FnXqBfXJc';

			const decoded = decodeJWT(token);

			expect(decoded.payload.iat).toBe(1516239022);
			expect(decoded.payload.exp).toBe(9999999999);
		});

		it('should handle token string directly', () => {
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMzQ1IiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.4Adcj0pW6hGnT5bCz0FnXqBfXJfKs5wXb4FnXqBfXJc';

			const decoded = decodeJWT(token);

			expect(decoded.payload.sub).toBe('user-12345');
		});
	});
});
