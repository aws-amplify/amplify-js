import { AuthError } from '../../src/errors/AuthError';

describe('AuthError', () => {
	it('works with instanceof operator', () => {
		const error = new AuthError({
			name: 'TestError',
			message: 'message',
		});

		expect(error instanceof AuthError).toBe(true);
	});
});
