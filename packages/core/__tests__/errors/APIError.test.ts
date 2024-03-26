import { ApiError } from '../../src/errors/APIError';

describe('ApiError', () => {
	it('works with instanceof operator', () => {
		const error = new ApiError({
			name: 'TestError',
			message: 'message',
		});

		expect(error instanceof ApiError).toBe(true);
	});
});
